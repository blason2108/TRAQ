# violation_engine/analytics.py
# ─────────────────────────────────────────────
# Analytics and report generation.
#
# Functions:
#   save_violations_json()   → violations.json
#   save_anpr_csv()          → anpr_registry.csv
#   generate_charts()        → analytics.png
#   print_summary()          → console summary
#   evaluate_metrics()       → precision/recall/F1 if gt_labels.json exists
# ─────────────────────────────────────────────

import json
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
from typing import List

from .models import ViolationEvent
from .anpr   import ANPRRegistry

LABEL_COLORS = {
    'Helmet non-compliance':  (0,   0,   255),
    'Triple riding':          (255, 0,   255),
    'Wrong-side driving':     (255, 0,   0),
    'Stop-line violation':    (0,   200, 255),
    'Red-light violation':    (0,   0,   200),
    'Illegal parking':        (128, 0,   255),
}


def _bgr_to_hex(bgr_tuple) -> str:
    b, g, r = bgr_tuple
    return f'#{r:02x}{g:02x}{b:02x}'


# ── Data export ───────────────────────────────

def save_violations_json(events: List[ViolationEvent],
                          output_path: Path) -> None:
    """Serialise all resolved ViolationEvents to JSON."""
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, 'w') as f:
        json.dump([ev.to_dict() for ev in events], f, indent=2)
    print(f'✓ violations.json → {output_path}')


def save_anpr_csv(anpr: ANPRRegistry, output_path: Path) -> None:
    """Export the full ANPR registry to CSV."""
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    anpr.to_df().to_csv(output_path, index=False)
    print(f'✓ anpr_registry.csv → {output_path}')


# ── Charts ────────────────────────────────────

def generate_charts(events: List[ViolationEvent],
                     fps: float,
                     output_path: Path) -> None:
    """
    Generate a 2×2 analytics chart and save as PNG.

    Charts:
      1. Violations by type (horizontal bar)
      2. Confidence score distribution (histogram)
      3. Violation timeline (line chart)
      4. Top repeat offenders by plate (bar chart)
    """
    if not events:
        print('No violations to chart.')
        return

    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    df = pd.DataFrame([ev.to_dict() for ev in events])
    df['second'] = (df['first_frame'] / fps).astype(int)

    fig, axes = plt.subplots(2, 2, figsize=(16, 10))
    fig.suptitle('Traffic Violation Analytics', fontsize=15, fontweight='bold')

    # ─ 1. Violation type count ────────────────
    ax     = axes[0, 0]
    counts = df['violation'].value_counts()
    colors = [_bgr_to_hex(LABEL_COLORS.get(v, (120, 120, 200)))
              for v in counts.index]
    bars = ax.barh(counts.index, counts.values, color=colors)
    ax.bar_label(bars, padding=3, fontsize=9)
    ax.set_title('Violations by type')
    ax.set_xlabel('Count')
    ax.invert_yaxis()

    # ─ 2. Confidence distribution ─────────────
    ax = axes[0, 1]
    ax.hist(df['confidence'], bins=20,
            color='steelblue', edgecolor='white', alpha=0.85)
    ax.axvline(df['confidence'].mean(), color='red', linestyle='--',
               label=f'Mean: {df["confidence"].mean():.2f}')
    ax.set_title('Confidence distribution')
    ax.set_xlabel('Fused confidence')
    ax.set_ylabel('Count')
    ax.legend()

    # ─ 3. Violation timeline ──────────────────
    ax = axes[1, 0]
    tl = df.groupby('second').size()
    ax.plot(tl.index, tl.values, color='crimson', linewidth=1.5)
    ax.fill_between(tl.index, tl.values, alpha=0.2, color='crimson')
    ax.set_title('Violation timeline')
    ax.set_xlabel('Time (seconds)')
    ax.set_ylabel('Events per second')

    # ─ 4. Top repeat offenders ────────────────
    ax  = axes[1, 1]
    rpt = df[df['plate'] != 'UNKNOWN']['plate'].value_counts().head(10)
    if not rpt.empty:
        ax.bar(rpt.index, rpt.values, color='darkorange')
        ax.set_title('Top repeat offenders')
        ax.set_xlabel('Plate')
        ax.set_ylabel('Violations')
        ax.tick_params(axis='x', rotation=45)
    else:
        ax.text(0.5, 0.5, 'No plates recognised',
                ha='center', transform=ax.transAxes)
        ax.set_title('Top repeat offenders')

    plt.tight_layout()
    plt.savefig(str(output_path), dpi=150, bbox_inches='tight')
    plt.close()
    print(f'✓ analytics.png → {output_path}')


# ── Console summary ───────────────────────────

def print_summary(events: List[ViolationEvent]) -> None:
    """Print a formatted summary to stdout."""
    if not events:
        print('No violations detected.')
        return

    df     = pd.DataFrame([ev.to_dict() for ev in events])
    counts = df['violation'].value_counts()

    print('\n' + '=' * 55)
    print('  TRAQ — VIOLATION SUMMARY')
    print('=' * 55)
    print(f'  Total violations  : {len(df)}')
    print(f'  Unique plates     : {df["plate"].nunique()}')
    print(f'  Mean confidence   : {df["confidence"].mean():.3f}')
    print(f'  Exempt vehicles   : {df["exempt"].sum()}')
    print()
    print('  Breakdown:')
    for vtype, cnt in counts.items():
        print(f'    {vtype:<32} {cnt}')
    print('=' * 55)


# ── Evaluation (requires ground-truth labels) ─

def evaluate_metrics(events: List[ViolationEvent],
                      gt_path: Path) -> None:
    """
    Compute Precision, Recall, F1, and mAP proxy.

    Requires a ground-truth file at gt_path with format:
      [{"frame_idx": 120, "violation": "Helmet non-compliance"}, ...]

    Prints classification report + saves confusion matrix PNG
    in the same directory as gt_path.
    """
    from sklearn.metrics import (classification_report,
                                 confusion_matrix, f1_score)

    gt_path = Path(gt_path)
    if not gt_path.exists():
        print(f'Ground-truth file not found: {gt_path}')
        print('Skipping evaluation.')
        print('Format: [{"frame_idx": 120, "violation": "Helmet non-compliance"}, ...]')
        return

    with open(gt_path) as f:
        gt_raw = json.load(f)

    all_vtypes = sorted(set(
        [r['violation'] for r in gt_raw] +
        [ev.violation   for ev in events]
    ))

    gt_map   = {r['frame_idx']: r['violation'] for r in gt_raw}
    pred_map = {ev.first_frame: ev.violation   for ev in events}
    all_f    = sorted(set(list(gt_map) + list(pred_map)))

    y_true = [gt_map.get(f,   'No violation') for f in all_f]
    y_pred = [pred_map.get(f, 'No violation') for f in all_f]

    print('\nClassification Report:')
    print(classification_report(y_true, y_pred,
                                 labels=all_vtypes, zero_division=0))

    # Confusion matrix
    cm = confusion_matrix(y_true, y_pred, labels=all_vtypes)
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                xticklabels=all_vtypes, yticklabels=all_vtypes)
    plt.title('Confusion Matrix')
    plt.ylabel('Ground Truth')
    plt.xlabel('Predicted')
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()

    cm_path = gt_path.parent / 'confusion_matrix.png'
    plt.savefig(str(cm_path), dpi=150)
    plt.close()
    print(f'✓ Confusion matrix → {cm_path}')

    # mAP proxy
    f1s = f1_score(y_true, y_pred, labels=all_vtypes,
                   average=None, zero_division=0)
    print(f'\n  mAP@0.5 proxy (mean F1): {np.mean(f1s):.4f}')
