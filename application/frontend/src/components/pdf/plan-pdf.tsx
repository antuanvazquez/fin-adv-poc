import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import type { Household } from '@/lib/types';

// ── Styles ──────────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  // Pages
  coverPage: {
    backgroundColor: '#0A0F1C',
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  page: {
    backgroundColor: '#0A0F1C',
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 48,
    fontFamily: 'Helvetica',
  },

  // Cover elements
  coverGoldLine: {
    width: 64,
    height: 3,
    backgroundColor: '#C9A962',
    borderRadius: 2,
    marginBottom: 24,
  },
  coverTitle: {
    fontSize: 36,
    fontFamily: 'Helvetica-Bold',
    color: '#F0F0F5',
    textAlign: 'center',
    marginBottom: 8,
  },
  coverSubtitle: {
    fontSize: 14,
    color: '#C9A962',
    textAlign: 'center',
    marginBottom: 32,
  },
  coverMeta: {
    fontSize: 10,
    color: '#8B8FA3',
    textAlign: 'center',
    marginTop: 4,
  },

  // Section header
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#F0F0F5',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 10,
    color: '#8B8FA3',
    marginBottom: 16,
  },
  goldDivider: {
    width: 40,
    height: 2,
    backgroundColor: '#C9A962',
    borderRadius: 1,
    marginBottom: 20,
  },

  // Card
  card: {
    backgroundColor: '#131A2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    border: '1px solid #1E2A45',
  },
  cardTitle: {
    fontSize: 10,
    color: '#8B8FA3',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  cardValue: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#F0F0F5',
  },
  cardValueGold: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#C9A962',
  },
  cardValueGreen: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#34D399',
  },
  cardValueRed: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#F87171',
  },

  // Two-column layout
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  col: {
    flex: 1,
  },

  // Great 8 grid
  great8Grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  great8Cell: {
    width: '31%',
    backgroundColor: '#131A2E',
    borderRadius: 10,
    padding: 12,
    border: '1px solid #1E2A45',
    minHeight: 80,
    justifyContent: 'space-between',
  },
  great8CenterCell: {
    width: '31%',
    backgroundColor: '#0D1525',
    borderRadius: 10,
    padding: 12,
    border: '1px solid #C9A962',
    minHeight: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  great8Num: {
    fontSize: 9,
    color: '#4A5068',
    marginBottom: 4,
  },
  great8Label: {
    fontSize: 8,
    color: '#8B8FA3',
    marginBottom: 6,
  },
  great8Value: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#C9A962',
  },
  great8Sub: {
    fontSize: 8,
    color: '#4A5068',
    marginTop: 2,
  },
  great8CenterNumber: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: '#C9A962',
  },
  great8CenterText: {
    fontSize: 8,
    color: '#C9A962',
    textAlign: 'center',
  },

  // Table
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 6,
    borderBottom: '1px solid #1E2A45',
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderBottom: '1px solid #1E2A45',
  },
  tableCell: {
    flex: 1,
    fontSize: 9,
    color: '#8B8FA3',
  },
  tableCellBold: {
    flex: 1,
    fontSize: 9,
    color: '#F0F0F5',
    fontFamily: 'Helvetica-Bold',
  },

  // Text styles
  label: {
    fontSize: 9,
    color: '#8B8FA3',
    marginBottom: 2,
  },
  value: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#F0F0F5',
    marginBottom: 8,
  },
  valueGold: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#C9A962',
    marginBottom: 8,
  },
  body: {
    fontSize: 10,
    color: '#8B8FA3',
    lineHeight: 1.5,
  },
  bodyWhite: {
    fontSize: 10,
    color: '#F0F0F5',
    lineHeight: 1.5,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  checkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34D399',
  },
  checkDotRed: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F87171',
  },

  // Page number
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    right: 48,
    fontSize: 9,
    color: '#4A5068',
  },
  pageFooter: {
    position: 'absolute',
    bottom: 20,
    left: 48,
    fontSize: 9,
    color: '#4A5068',
  },
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtCurrency(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function fmtPct(n: number) {
  return `${Math.round(n)}%`;
}

function scoreColor(score: number) {
  if (score >= 80) return '#34D399';
  if (score >= 60) return '#C9A962';
  return '#F87171';
}

// ── Sub-components ───────────────────────────────────────────────────────────

function PageFooter({ householdName, pageNum }: { householdName: string; pageNum: number }) {
  return (
    <>
      <Text style={S.pageFooter}>{householdName}</Text>
      <Text style={S.pageNumber}>{pageNum}</Text>
    </>
  );
}

// ── Main Document ────────────────────────────────────────────────────────────

export function buildPlanDocument(household: Household) {
  return PlanPDF({ household });
}

export function PlanPDF({ household }: { household: Household }) {
  const plan = household.financialPlan;
  const {
    netWorth,
    cashReserve,
    discretionaryIncome,
    disabilityInsurance,
    lifeInsurance,
    longTermCare,
    retirementAssets,
    estatePlanning,
    assetAllocation,
  } = plan;

  const today = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const discretionary = Math.max(
    0,
    discretionaryIncome.grossIncome -
      discretionaryIncome.taxes -
      discretionaryIncome.fixedExpenses -
      discretionaryIncome.variableExpenses,
  );

  const completedDocs = estatePlanning.documents.filter((d) => d.completed).length;

  // Great 8 items for the summary grid
  const g8Items = [
    {
      num: 1,
      label: 'Net Worth',
      value: fmtCurrency(netWorth.netWorth),
      sub: `${fmtCurrency(netWorth.totalAssets)} assets`,
    },
    {
      num: 2,
      label: 'Cash Reserve',
      value: fmtCurrency(cashReserve.currentReserve),
      sub: `${(cashReserve.currentReserve / (cashReserve.monthlyExpenses || 1)).toFixed(1)} months`,
    },
    {
      num: 3,
      label: 'Discretionary Income',
      value: fmtCurrency(discretionary),
      sub: 'annual',
    },
    {
      num: 4,
      label: 'Disability Insurance',
      value: disabilityInsurance.currentCoverage.length > 0 && disabilityInsurance.currentCoverage.some(c => c.amount > 0)
        ? disabilityInsurance.currentCoverage.map(c => `$${(c.amount / 1000).toFixed(0)}K`).join(' & ')
        : 'No coverage',
      sub: disabilityInsurance.currentCoverage.length > 0
        ? disabilityInsurance.currentCoverage.map(c => c.person.split(' ')[0]).join(' & ')
        : '',
    },
    {
      num: 5,
      label: 'Life Insurance',
      value: lifeInsurance.currentCoverage.length > 0 && lifeInsurance.currentCoverage.some(c => c.amount > 0)
        ? lifeInsurance.currentCoverage.map(c => fmtCurrency(c.amount)).join(' & ')
        : 'No coverage',
      sub: lifeInsurance.currentCoverage.length > 0
        ? lifeInsurance.currentCoverage.map(c => c.person.split(' ')[0]).join(' & ')
        : '',
    },
    {
      num: 6,
      label: 'Long-Term Care',
      value: longTermCare.currentCoverage.length > 0 && longTermCare.currentCoverage.some(c => c.amount > 0)
        ? longTermCare.currentCoverage.map(c => fmtCurrency(c.amount)).join(' & ')
        : '$0 & $0',
      sub: 'benefit',
    },
    {
      num: 7,
      label: 'Retirement Assets',
      value: fmtCurrency(retirementAssets.totalEarmarked),
      sub: `${retirementAssets.percentFunded}% funded`,
    },
    {
      num: 8,
      label: 'Estate Planning',
      value: fmtCurrency(estatePlanning.totalEstateValue),
      sub: `${completedDocs}/${estatePlanning.documents.length} docs`,
    },
  ];

  // Grid order: [0,1,2, 3,null,4, 5,6,7]
  const gridOrder: (number | null)[] = [0, 1, 2, 3, null, 4, 5, 6, 7];

  return (
    <Document title={`${household.name} — Financial Plan`} author="Advisor Platform">
      {/* ── Page 1: Cover ─────────────────────────────────────────── */}
      <Page size="A4" style={S.coverPage}>
        <View style={S.coverGoldLine} />
        <Text style={S.coverTitle}>{household.name}</Text>
        <Text style={S.coverSubtitle}>Financial Planning Proposal</Text>
        <View style={{ width: 200, height: 1, backgroundColor: '#1E2A45', marginBottom: 24 }} />
        <Text style={S.coverMeta}>Prepared by Alanna Shepherd, CFP®</Text>
        <Text style={S.coverMeta}>Meridian Wealth Partners</Text>
        <Text style={{ ...S.coverMeta, marginTop: 8 }}>{today}</Text>
        <View style={{ width: 40, height: 2, backgroundColor: '#C9A962', marginTop: 32, borderRadius: 1 }} />
      </Page>

      {/* ── Page 2: Your Great 8 Summary ──────────────────────────── */}
      <Page size="A4" style={S.page}>
        <Text style={{ ...S.body, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>
          to conclude —
        </Text>
        <Text style={{ ...S.coverTitle, fontSize: 28, marginBottom: 4 }}>your great 8</Text>
        <Text style={{ ...S.coverMeta, textAlign: 'center', marginBottom: 20 }}>
          8 checkpoints for your financial health
        </Text>
        <View style={S.goldDivider} />

        <View style={S.great8Grid}>
          {gridOrder.map((idx, cellIdx) => {
            if (idx === null) {
              return (
                <View key="center" style={S.great8CenterCell}>
                  <Text style={S.great8CenterText}>your</Text>
                  <Text style={S.great8CenterNumber}>8</Text>
                  <Text style={S.great8CenterText}>checkpoints</Text>
                </View>
              );
            }
            const item = g8Items[idx];
            return (
              <View key={item.num} style={S.great8Cell}>
                <Text style={S.great8Num}>#{item.num}</Text>
                <Text style={S.great8Label}>{item.label}</Text>
                <Text style={S.great8Value}>{item.value}</Text>
                {item.sub ? <Text style={S.great8Sub}>{item.sub}</Text> : null}
              </View>
            );
          })}
        </View>

        <PageFooter householdName={household.name} pageNum={2} />
      </Page>

      {/* ── Page 3: Net Worth ──────────────────────────────────────── */}
      <Page size="A4" style={S.page}>
        <Text style={S.sectionTitle}>Net Worth</Text>
        <View style={S.goldDivider} />

        <View style={S.row}>
          <View style={S.col}>
            <View style={S.card}>
              <Text style={S.cardTitle}>Total Assets</Text>
              <Text style={S.cardValueGold}>{fmtCurrency(netWorth.totalAssets)}</Text>
            </View>
            <View style={S.card}>
              <Text style={S.cardTitle}>Total Liabilities</Text>
              <Text style={{ ...S.cardValue, color: '#F87171' }}>{fmtCurrency(netWorth.totalLiabilities)}</Text>
            </View>
            <View style={{ ...S.card, backgroundColor: '#0A0F1C', border: '1px solid #C9A962' }}>
              <Text style={S.cardTitle}>Net Worth</Text>
              <Text style={{ ...S.cardValueGold, fontSize: 26 }}>{fmtCurrency(netWorth.netWorth)}</Text>
            </View>
          </View>
          <View style={S.col}>
            <Text style={{ ...S.label, marginBottom: 8 }}>Asset Breakdown</Text>
            {netWorth.assets.map((a) => (
              <View key={a.category} style={S.tableRow}>
                <Text style={S.tableCell}>{a.category}</Text>
                <Text style={S.tableCellBold}>{fmtCurrency(a.amount)}</Text>
              </View>
            ))}
            {netWorth.liabilities.length > 0 && (
              <>
                <Text style={{ ...S.label, marginTop: 12, marginBottom: 4 }}>Liabilities</Text>
                {netWorth.liabilities.map((l) => (
                  <View key={l.category} style={S.tableRow}>
                    <Text style={S.tableCell}>{l.category}</Text>
                    <Text style={{ ...S.tableCellBold, color: '#F87171' }}>{fmtCurrency(l.amount)}</Text>
                  </View>
                ))}
              </>
            )}
          </View>
        </View>

        <PageFooter householdName={household.name} pageNum={3} />
      </Page>

      {/* ── Page 4: Cash Reserve & Discretionary Income ───────────── */}
      <Page size="A4" style={S.page}>
        <Text style={S.sectionTitle}>Cash Reserve</Text>
        <View style={S.goldDivider} />

        <View style={S.row}>
          <View style={{ ...S.col, ...S.card }}>
            <Text style={S.label}>Current Reserve</Text>
            <Text style={S.valueGold}>{fmtCurrency(cashReserve.currentReserve)}</Text>
            <Text style={S.label}>Monthly Expenses</Text>
            <Text style={S.value}>{fmtCurrency(cashReserve.monthlyExpenses)}</Text>
            <Text style={S.label}>Target ({cashReserve.targetMonths} months)</Text>
            <Text style={S.value}>{fmtCurrency(cashReserve.goal)}</Text>
          </View>
          <View style={{ ...S.col, ...S.card }}>
            <Text style={S.label}>Coverage</Text>
            <Text style={{ ...S.cardValueGold, fontSize: 28 }}>
              {(cashReserve.currentReserve / (cashReserve.monthlyExpenses || 1)).toFixed(1)} mo
            </Text>
            {cashReserve.shortage > 0 ? (
              <>
                <Text style={{ ...S.label, marginTop: 8 }}>Shortage</Text>
                <Text style={{ ...S.value, color: '#F87171' }}>{fmtCurrency(cashReserve.shortage)}</Text>
              </>
            ) : (
              <Text style={{ ...S.label, color: '#34D399', marginTop: 8 }}>Fully funded ✓</Text>
            )}
          </View>
        </View>

        <View style={{ height: 24 }} />
        <Text style={S.sectionTitle}>Discretionary Income</Text>
        <View style={S.goldDivider} />

        <View style={S.row}>
          <View style={S.col}>
            {[
              { label: 'Gross Income', value: discretionaryIncome.grossIncome, color: '#F0F0F5' },
              { label: 'Taxes', value: discretionaryIncome.taxes, color: '#F87171' },
              { label: 'Fixed Expenses', value: discretionaryIncome.fixedExpenses, color: '#F87171' },
              { label: 'Variable Expenses', value: discretionaryIncome.variableExpenses, color: '#F87171' },
            ].map((r) => (
              <View key={r.label} style={S.tableRow}>
                <Text style={S.tableCell}>{r.label}</Text>
                <Text style={{ ...S.tableCellBold, color: r.color }}>{fmtCurrency(r.value)}</Text>
              </View>
            ))}
            <View style={{ ...S.tableRow, borderTopWidth: 1, borderColor: '#C9A962', marginTop: 4 }}>
              <Text style={{ ...S.tableCellBold, color: '#C9A962' }}>Discretionary</Text>
              <Text style={{ ...S.tableCellBold, color: '#C9A962' }}>{fmtCurrency(discretionary)}</Text>
            </View>
          </View>
          <View style={{ ...S.col, ...S.card, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={S.cardTitle}>Savings Rate</Text>
            <Text style={{ ...S.cardValueGold, fontSize: 32 }}>
              {fmtPct(discretionaryIncome.grossIncome > 0 ? (discretionary / discretionaryIncome.grossIncome) * 100 : 0)}
            </Text>
          </View>
        </View>

        <PageFooter householdName={household.name} pageNum={4} />
      </Page>

      {/* ── Page 5: Insurance ─────────────────────────────────────── */}
      <Page size="A4" style={S.page}>
        <Text style={S.sectionTitle}>Insurance Overview</Text>
        <View style={S.goldDivider} />

        {[
          { label: 'Disability Insurance', data: disabilityInsurance },
          { label: 'Life Insurance', data: lifeInsurance },
          { label: 'Long-Term Care', data: longTermCare },
        ].map((ins) => {
          const shortage = ins.data.shortage.reduce((s, c) => s + c.amount, 0);
          return (
            <View key={ins.label} style={{ marginBottom: 16 }}>
              <Text style={{ ...S.label, fontSize: 11, color: '#F0F0F5', marginBottom: 8 }}>{ins.label}</Text>
              <View style={S.row}>
                <View style={S.col}>
                  {ins.data.currentCoverage.map((c) => (
                    <View key={c.person} style={S.tableRow}>
                      <Text style={S.tableCell}>{c.person.split(' ')[0]}</Text>
                      <Text style={S.tableCellBold}>{fmtCurrency(c.amount)}</Text>
                    </View>
                  ))}
                  {ins.data.currentCoverage.length === 0 && (
                    <Text style={{ ...S.body, color: '#F87171' }}>No coverage on file</Text>
                  )}
                </View>
                <View style={S.col}>
                  {shortage > 0 ? (
                    <View style={{ backgroundColor: '#F87171', borderRadius: 6, padding: 8, opacity: 0.15 }}>
                      <Text style={{ ...S.body, color: '#F87171' }}>
                        Shortage: {fmtCurrency(shortage)}
                      </Text>
                    </View>
                  ) : (
                    <Text style={{ ...S.body, color: '#34D399' }}>Coverage meets target ✓</Text>
                  )}
                </View>
              </View>
            </View>
          );
        })}

        <PageFooter householdName={household.name} pageNum={5} />
      </Page>

      {/* ── Page 6: Retirement Assets ─────────────────────────────── */}
      <Page size="A4" style={S.page}>
        <Text style={S.sectionTitle}>Retirement Assets</Text>
        <View style={S.goldDivider} />

        <View style={S.row}>
          <View style={S.col}>
            <View style={S.card}>
              <Text style={S.cardTitle}>Total Earmarked</Text>
              <Text style={S.cardValueGold}>{fmtCurrency(retirementAssets.totalEarmarked)}</Text>
            </View>
            <View style={S.card}>
              <Text style={S.cardTitle}>Retirement Goal</Text>
              <Text style={S.cardValue}>{fmtCurrency(retirementAssets.retirementGoal)}</Text>
            </View>
            <View style={{ ...S.card, border: retirementAssets.shortage > 0 ? '1px solid #F87171' : '1px solid #34D399' }}>
              <Text style={S.cardTitle}>{retirementAssets.shortage > 0 ? 'Shortage' : 'Status'}</Text>
              <Text style={{ ...S.cardValue, color: retirementAssets.shortage > 0 ? '#F87171' : '#34D399' }}>
                {retirementAssets.shortage > 0 ? fmtCurrency(retirementAssets.shortage) : 'On Track'}
              </Text>
            </View>
          </View>
          <View style={S.col}>
            <Text style={{ ...S.label, fontSize: 11, color: '#F0F0F5', marginBottom: 8 }}>
              Funded: {retirementAssets.percentFunded}%
            </Text>
            {retirementAssets.accounts.map((acc) => (
              <View key={acc.id} style={S.tableRow}>
                <Text style={S.tableCell}>{acc.name}</Text>
                <Text style={{ ...S.tableCell, color: '#8B8FA3', fontSize: 8 }}>{acc.type.toUpperCase()}</Text>
                <Text style={S.tableCellBold}>{fmtCurrency(acc.balance)}</Text>
              </View>
            ))}
          </View>
        </View>

        <PageFooter householdName={household.name} pageNum={6} />
      </Page>

      {/* ── Page 7: Estate Planning ───────────────────────────────── */}
      <Page size="A4" style={S.page}>
        <Text style={S.sectionTitle}>Estate Planning</Text>
        <View style={S.goldDivider} />

        <View style={S.row}>
          <View style={S.col}>
            <Text style={{ ...S.label, marginBottom: 10 }}>Document Status</Text>
            {estatePlanning.documents.map((doc) => (
              <View key={doc.name} style={S.checkItem}>
                <View style={doc.completed ? S.checkDot : S.checkDotRed} />
                <Text style={{ ...S.body, color: doc.completed ? '#F0F0F5' : '#F87171' }}>
                  {doc.name}
                </Text>
              </View>
            ))}
            <Text style={{ ...S.label, marginTop: 12 }}>
              Completion: {completedDocs}/{estatePlanning.documents.length} documents
            </Text>
          </View>
          <View style={S.col}>
            <View style={S.card}>
              <Text style={S.cardTitle}>Total Estate Value</Text>
              <Text style={S.cardValueGold}>{fmtCurrency(estatePlanning.totalEstateValue)}</Text>
            </View>
            <Text style={{ ...S.label, marginTop: 12, marginBottom: 6 }}>Beneficiaries</Text>
            {estatePlanning.beneficiaries.map((b) => (
              <View key={b.name} style={S.tableRow}>
                <Text style={S.tableCell}>{b.name}</Text>
                <Text style={{ ...S.tableCell, color: '#8B8FA3', fontSize: 8 }}>{b.relationship}</Text>
                <Text style={S.tableCellBold}>{b.percentage}%</Text>
              </View>
            ))}
          </View>
        </View>

        <PageFooter householdName={household.name} pageNum={7} />
      </Page>

      {/* ── Page 8: Asset Allocation ──────────────────────────────── */}
      <Page size="A4" style={S.page}>
        <Text style={S.sectionTitle}>Asset Allocation</Text>
        <View style={S.goldDivider} />

        <View style={S.row}>
          <View style={S.col}>
            <Text style={{ ...S.label, marginBottom: 8 }}>Current Allocation</Text>
            {assetAllocation.current.map((a) => (
              <View key={a.category} style={S.tableRow}>
                <Text style={S.tableCell}>{a.category}</Text>
                <Text style={S.tableCellBold}>{a.percentage}%</Text>
              </View>
            ))}
          </View>
          <View style={S.col}>
            <Text style={{ ...S.label, marginBottom: 8 }}>Target Allocation</Text>
            {assetAllocation.target.map((a) => (
              <View key={a.category} style={S.tableRow}>
                <Text style={S.tableCell}>{a.category}</Text>
                <Text style={S.tableCellBold}>{a.percentage}%</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ marginTop: 24 }}>
          <Text style={{ ...S.label, marginBottom: 8 }}>Risk Profile</Text>
          {household.clients.map((c) => (
            <View key={c.id} style={S.tableRow}>
              <Text style={S.tableCell}>{c.firstName} {c.lastName}</Text>
              <Text style={S.tableCellBold}>
                {c.riskTolerance.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </Text>
            </View>
          ))}
        </View>

        <PageFooter householdName={household.name} pageNum={8} />
      </Page>
    </Document>
  );
}
