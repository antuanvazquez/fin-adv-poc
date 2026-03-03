'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  User,
  DollarSign,
  Wallet,
  PiggyBank,
  Shield,
  Target,
  ScrollText,
  BarChart3,
  TrendingUp,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { getHousehold } from '@/lib/mock-data';
import { formatCurrency, cn } from '@/lib/utils';

const STEP_LABELS = [
  'Personal Info',
  'Net Worth',
  'Income & Expenses',
  'Cash Reserve',
  'Insurance',
  'Retirement',
  'Estate Planning',
  'Risk Tolerance',
] as const;

const STEP_ICONS = [
  User,
  DollarSign,
  Wallet,
  PiggyBank,
  Shield,
  Target,
  ScrollText,
  BarChart3,
];

interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  occupation: string;
  employer: string;
  retirementAge: string;
}

interface AssetItem {
  category: string;
  amount: number;
}

interface IncomeExpenses {
  grossIncome: string;
  estimatedTaxes: string;
  fixedMonthly: string;
  variableMonthly: string;
}

interface CashReserveData {
  liquidAssets: string;
  monthlyExpenses: string;
  targetMonths: number;
}

interface RetirementAccount {
  id: string;
  type: string;
  name: string;
  balance: string;
  contributionRate: string;
}

interface EstateDocument {
  name: string;
  completed: boolean;
}

interface RiskAnswers {
  dropReaction: string;
  primaryGoal: string;
  timeHorizon: string;
  experience: string;
}

interface FormData {
  personal: PersonalInfo;
  assets: AssetItem[];
  liabilities: AssetItem[];
  incomeExpenses: IncomeExpenses;
  cashReserve: CashReserveData;
  retirementAccounts: RetirementAccount[];
  retirementGoal: string;
  estateDocuments: EstateDocument[];
  riskAnswers: RiskAnswers;
}

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};

export default function IntakePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const household = getHousehold(id);

  const client = household?.clients[0];
  const plan = household?.financialPlan;

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState<FormData>(() => ({
    personal: {
      firstName: client?.firstName ?? '',
      lastName: client?.lastName ?? '',
      email: client?.email ?? '',
      phone: client?.phone ?? '',
      dateOfBirth: client?.dateOfBirth ?? '',
      occupation: client?.occupation ?? '',
      employer: client?.employer ?? '',
      retirementAge: String(client?.retirementAge ?? 65),
    },
    assets: plan?.netWorth.assets.map((a) => ({ ...a })) ?? [
      { category: 'Retirement Accounts', amount: 0 },
      { category: 'Brokerage', amount: 0 },
      { category: 'Real Estate', amount: 0 },
      { category: 'Cash & Equivalents', amount: 0 },
    ],
    liabilities: plan?.netWorth.liabilities.length
      ? plan.netWorth.liabilities.map((l) => ({ ...l }))
      : [{ category: 'Mortgage', amount: 0 }],
    incomeExpenses: {
      grossIncome: plan ? String(plan.discretionaryIncome.grossIncome) : '',
      estimatedTaxes: plan ? String(plan.discretionaryIncome.taxes) : '',
      fixedMonthly: plan
        ? String(Math.round(plan.discretionaryIncome.fixedExpenses / 12))
        : '',
      variableMonthly: plan
        ? String(Math.round(plan.discretionaryIncome.variableExpenses / 12))
        : '',
    },
    cashReserve: {
      liquidAssets: plan ? String(plan.cashReserve.currentReserve) : '',
      monthlyExpenses: plan ? String(plan.cashReserve.monthlyExpenses) : '',
      targetMonths: plan?.cashReserve.targetMonths ?? 6,
    },
    retirementAccounts: plan?.retirementAssets.accounts.map((a) => ({
      id: a.id,
      type: a.type,
      name: a.name,
      balance: String(a.balance),
      contributionRate: String(a.contributionRate ?? 0),
    })) ?? [
      { id: 'new-1', type: '401k', name: '', balance: '', contributionRate: '' },
    ],
    retirementGoal: plan ? String(plan.retirementAssets.retirementGoal) : '',
    estateDocuments: plan?.estatePlanning.documents.map((d) => ({
      name: d.name,
      completed: d.completed,
    })) ?? [
      { name: 'Will', completed: false },
      { name: 'Living Will', completed: false },
      { name: 'Revocable Living Trust', completed: false },
      { name: 'Power of Attorney', completed: false },
      { name: 'Healthcare Proxy', completed: false },
    ],
    riskAnswers: {
      dropReaction: '',
      primaryGoal: '',
      timeHorizon: '',
      experience: '',
    },
  }));

  function goNext() {
    if (currentStep < 7) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    }
  }

  function goPrev() {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    }
  }

  function handleSubmit() {
    setSubmitted(true);
  }

  function updatePersonal(field: keyof PersonalInfo, value: string) {
    setFormData((prev) => ({
      ...prev,
      personal: { ...prev.personal, [field]: value },
    }));
  }

  function updateAsset(index: number, amount: number) {
    setFormData((prev) => {
      const updated = [...prev.assets];
      updated[index] = { ...updated[index], amount };
      return { ...prev, assets: updated };
    });
  }

  function updateLiability(index: number, amount: number) {
    setFormData((prev) => {
      const updated = [...prev.liabilities];
      updated[index] = { ...updated[index], amount };
      return { ...prev, liabilities: updated };
    });
  }

  function updateIncome(field: keyof IncomeExpenses, value: string) {
    setFormData((prev) => ({
      ...prev,
      incomeExpenses: { ...prev.incomeExpenses, [field]: value },
    }));
  }

  function updateCashReserve(field: keyof CashReserveData, value: string | number) {
    setFormData((prev) => ({
      ...prev,
      cashReserve: { ...prev.cashReserve, [field]: value },
    }));
  }

  function updateRetirementAccount(
    index: number,
    field: keyof RetirementAccount,
    value: string,
  ) {
    setFormData((prev) => {
      const updated = [...prev.retirementAccounts];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, retirementAccounts: updated };
    });
  }

  function toggleEstateDoc(index: number) {
    setFormData((prev) => {
      const updated = [...prev.estateDocuments];
      updated[index] = { ...updated[index], completed: !updated[index].completed };
      return { ...prev, estateDocuments: updated };
    });
  }

  function updateRisk(field: keyof RiskAnswers, value: string) {
    setFormData((prev) => ({
      ...prev,
      riskAnswers: { ...prev.riskAnswers, [field]: value },
    }));
  }

  if (!household) {
    return (
      <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-[#F0F0F5] text-lg">Household not found</p>
          <Link href="/clients">
            <Button variant="secondary" className="mt-4">
              Back to Clients
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center p-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="max-w-lg w-full text-center p-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto mb-6 w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center"
            >
              <motion.div
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </motion.div>
            </motion.div>
            <h2 className="text-2xl font-bold text-[#F0F0F5] mb-2">
              Intake Complete
            </h2>
            <p className="text-[#8B8FA3] mb-2">
              Financial information for{' '}
              <span className="text-[#C9A962]">{household.name}</span> has been
              submitted successfully.
            </p>
            <p className="text-[#8B8FA3] text-sm mb-8">
              Your advisor will review the data and prepare a comprehensive
              financial plan based on the Great 8 framework.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href={`/clients/${id}`}>
                <Button variant="secondary">View Household</Button>
              </Link>
              <Link href="/clients">
                <Button>Back to Clients</Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  const totalAssets = formData.assets.reduce((s, a) => s + a.amount, 0);
  const totalLiabilities = formData.liabilities.reduce((s, l) => s + l.amount, 0);

  return (
    <div className="min-h-screen bg-[#0A0F1C] p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/clients/${id}`}
            className="inline-flex items-center gap-1.5 text-[#8B8FA3] hover:text-[#F0F0F5] transition-colors text-sm mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {household.name}
          </Link>
          <h1 className="text-3xl font-bold text-[#F0F0F5]">
            Financial Information Intake
          </h1>
          <p className="text-[#8B8FA3] mt-1">
            for{' '}
            <span className="text-[#C9A962]">{household.name}</span>
          </p>
        </div>

        {/* Step Indicator */}
        <Card className="mb-6 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {React.createElement(STEP_ICONS[currentStep], {
                className: 'w-4 h-4 text-[#C9A962]',
              })}
              <span className="text-sm font-medium text-[#F0F0F5]">
                {STEP_LABELS[currentStep]}
              </span>
            </div>
            <Badge variant="gold">
              Step {currentStep + 1} of 8
            </Badge>
          </div>
          <Progress value={((currentStep + 1) / 8) * 100} size="sm" />
          <div className="flex justify-between mt-2">
            {STEP_LABELS.map((label, i) => (
              <button
                key={label}
                onClick={() => {
                  setDirection(i > currentStep ? 1 : -1);
                  setCurrentStep(i);
                }}
                className={cn(
                  'text-[10px] transition-colors hidden sm:block',
                  i === currentStep
                    ? 'text-[#C9A962] font-medium'
                    : i < currentStep
                      ? 'text-emerald-400'
                      : 'text-[#4A5068]',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </Card>

        {/* Step Content */}
        <div className="relative overflow-hidden min-h-[480px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              {/* Step 0 — Personal Info */}
              {currentStep === 0 && (
                <Card>
                  <h2 className="text-lg font-semibold text-[#F0F0F5] mb-1">
                    Personal Information
                  </h2>
                  <p className="text-sm text-[#8B8FA3] mb-6">
                    Basic details for the primary client
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      value={formData.personal.firstName}
                      onChange={(e) => updatePersonal('firstName', e.target.value)}
                    />
                    <Input
                      label="Last Name"
                      value={formData.personal.lastName}
                      onChange={(e) => updatePersonal('lastName', e.target.value)}
                    />
                    <Input
                      label="Email"
                      type="email"
                      value={formData.personal.email}
                      onChange={(e) => updatePersonal('email', e.target.value)}
                    />
                    <Input
                      label="Phone"
                      type="tel"
                      value={formData.personal.phone}
                      onChange={(e) => updatePersonal('phone', e.target.value)}
                    />
                    <Input
                      label="Date of Birth"
                      type="date"
                      value={formData.personal.dateOfBirth}
                      onChange={(e) => updatePersonal('dateOfBirth', e.target.value)}
                    />
                    <Input
                      label="Occupation"
                      value={formData.personal.occupation}
                      onChange={(e) => updatePersonal('occupation', e.target.value)}
                    />
                    <Input
                      label="Employer"
                      value={formData.personal.employer}
                      onChange={(e) => updatePersonal('employer', e.target.value)}
                    />
                    <Input
                      label="Target Retirement Age"
                      type="number"
                      value={formData.personal.retirementAge}
                      onChange={(e) =>
                        updatePersonal('retirementAge', e.target.value)
                      }
                    />
                  </div>
                </Card>
              )}

              {/* Step 1 — Net Worth */}
              {currentStep === 1 && (
                <Card>
                  <h2 className="text-lg font-semibold text-[#F0F0F5] mb-1">
                    Net Worth
                  </h2>
                  <p className="text-sm text-[#8B8FA3] mb-6">
                    Assets and liabilities overview
                  </p>

                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-emerald-400 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Assets
                    </h3>
                    <div className="space-y-3">
                      {formData.assets.map((asset, i) => (
                        <div
                          key={asset.category}
                          className="flex items-center gap-3"
                        >
                          <span className="text-sm text-[#8B8FA3] w-48 shrink-0">
                            {asset.category}
                          </span>
                          <div className="flex-1">
                            <Input
                              type="number"
                              value={String(asset.amount)}
                              onChange={(e) =>
                                updateAsset(i, Number(e.target.value) || 0)
                              }
                              placeholder="0"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#1E2A45]">
                      <span className="text-sm font-medium text-[#F0F0F5]">
                        Total Assets
                      </span>
                      <span className="text-sm font-semibold text-emerald-400">
                        {formatCurrency(totalAssets)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-red-400 mb-3 flex items-center gap-2">
                      <TrendingDown className="w-4 h-4" />
                      Liabilities
                    </h3>
                    <div className="space-y-3">
                      {formData.liabilities.map((liability, i) => (
                        <div
                          key={liability.category}
                          className="flex items-center gap-3"
                        >
                          <span className="text-sm text-[#8B8FA3] w-48 shrink-0">
                            {liability.category}
                          </span>
                          <div className="flex-1">
                            <Input
                              type="number"
                              value={String(liability.amount)}
                              onChange={(e) =>
                                updateLiability(i, Number(e.target.value) || 0)
                              }
                              placeholder="0"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#1E2A45]">
                      <span className="text-sm font-medium text-[#F0F0F5]">
                        Total Liabilities
                      </span>
                      <span className="text-sm font-semibold text-red-400">
                        {formatCurrency(totalLiabilities)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#C9A962]/20">
                    <span className="text-base font-semibold text-[#F0F0F5]">
                      Net Worth
                    </span>
                    <span
                      className={cn(
                        'text-lg font-bold',
                        totalAssets - totalLiabilities >= 0
                          ? 'text-[#C9A962]'
                          : 'text-red-400',
                      )}
                    >
                      {formatCurrency(totalAssets - totalLiabilities)}
                    </span>
                  </div>
                </Card>
              )}

              {/* Step 2 — Income & Expenses */}
              {currentStep === 2 && (
                <Card>
                  <h2 className="text-lg font-semibold text-[#F0F0F5] mb-1">
                    Income & Expenses
                  </h2>
                  <p className="text-sm text-[#8B8FA3] mb-6">
                    Annual income and monthly expense breakdown
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Annual Gross Income"
                      type="number"
                      value={formData.incomeExpenses.grossIncome}
                      onChange={(e) => updateIncome('grossIncome', e.target.value)}
                      placeholder="e.g. 230000"
                    />
                    <Input
                      label="Estimated Annual Taxes"
                      type="number"
                      value={formData.incomeExpenses.estimatedTaxes}
                      onChange={(e) =>
                        updateIncome('estimatedTaxes', e.target.value)
                      }
                      placeholder="e.g. 57500"
                    />
                    <Input
                      label="Fixed Monthly Expenses"
                      type="number"
                      value={formData.incomeExpenses.fixedMonthly}
                      onChange={(e) => updateIncome('fixedMonthly', e.target.value)}
                      placeholder="e.g. 8200"
                    />
                    <Input
                      label="Variable Monthly Expenses"
                      type="number"
                      value={formData.incomeExpenses.variableMonthly}
                      onChange={(e) =>
                        updateIncome('variableMonthly', e.target.value)
                      }
                      placeholder="e.g. 2700"
                    />
                  </div>

                  {formData.incomeExpenses.grossIncome && (
                    <div className="mt-6 pt-4 border-t border-[#1E2A45]">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="text-[#8B8FA3]">Annual take-home</div>
                        <div className="text-right text-[#F0F0F5] font-medium">
                          {formatCurrency(
                            (Number(formData.incomeExpenses.grossIncome) || 0) -
                              (Number(formData.incomeExpenses.estimatedTaxes) || 0),
                          )}
                        </div>
                        <div className="text-[#8B8FA3]">
                          Total monthly expenses
                        </div>
                        <div className="text-right text-[#F0F0F5] font-medium">
                          {formatCurrency(
                            (Number(formData.incomeExpenses.fixedMonthly) || 0) +
                              (Number(formData.incomeExpenses.variableMonthly) || 0),
                          )}
                        </div>
                        <div className="text-[#8B8FA3]">
                          Monthly discretionary
                        </div>
                        <div className="text-right text-[#C9A962] font-semibold">
                          {formatCurrency(
                            Math.round(
                              ((Number(formData.incomeExpenses.grossIncome) || 0) -
                                (Number(formData.incomeExpenses.estimatedTaxes) ||
                                  0)) /
                                12,
                            ) -
                              ((Number(formData.incomeExpenses.fixedMonthly) || 0) +
                                (Number(formData.incomeExpenses.variableMonthly) ||
                                  0)),
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              )}

              {/* Step 3 — Cash Reserve */}
              {currentStep === 3 && (
                <Card>
                  <h2 className="text-lg font-semibold text-[#F0F0F5] mb-1">
                    Cash Reserve
                  </h2>
                  <p className="text-sm text-[#8B8FA3] mb-6">
                    Emergency fund and liquidity target
                  </p>
                  <div className="space-y-4">
                    <Input
                      label="Current Liquid Assets"
                      type="number"
                      value={formData.cashReserve.liquidAssets}
                      onChange={(e) =>
                        updateCashReserve('liquidAssets', e.target.value)
                      }
                      placeholder="e.g. 87000"
                    />
                    <Input
                      label="Monthly Expenses"
                      type="number"
                      value={formData.cashReserve.monthlyExpenses}
                      onChange={(e) =>
                        updateCashReserve('monthlyExpenses', e.target.value)
                      }
                      placeholder="e.g. 14800"
                    />

                    <div className="space-y-2">
                      <label className="text-sm text-[#8B8FA3] font-medium">
                        Target Reserve (months)
                      </label>
                      <div className="flex gap-3">
                        {[3, 4, 5, 6].map((m) => (
                          <button
                            key={m}
                            onClick={() => updateCashReserve('targetMonths', m)}
                            className={cn(
                              'flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border',
                              formData.cashReserve.targetMonths === m
                                ? 'bg-[#C9A962]/10 border-[#C9A962] text-[#C9A962]'
                                : 'border-[#1E2A45] text-[#8B8FA3] hover:border-[#2E3A55]',
                            )}
                          >
                            {m} months
                          </button>
                        ))}
                      </div>
                    </div>

                    {formData.cashReserve.liquidAssets &&
                      formData.cashReserve.monthlyExpenses && (
                        <div className="mt-4 pt-4 border-t border-[#1E2A45]">
                          {(() => {
                            const goal =
                              (Number(formData.cashReserve.monthlyExpenses) || 0) *
                              formData.cashReserve.targetMonths;
                            const current =
                              Number(formData.cashReserve.liquidAssets) || 0;
                            const pct = goal > 0 ? (current / goal) * 100 : 0;
                            const surplus = current - goal;
                            return (
                              <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                  <span className="text-[#8B8FA3]">
                                    Reserve Goal
                                  </span>
                                  <span className="text-[#F0F0F5] font-medium">
                                    {formatCurrency(goal)}
                                  </span>
                                </div>
                                <Progress value={Math.min(pct, 100)} showLabel />
                                <div className="flex justify-between text-sm">
                                  <span className="text-[#8B8FA3]">
                                    {surplus >= 0 ? 'Surplus' : 'Shortage'}
                                  </span>
                                  <span
                                    className={cn(
                                      'font-semibold',
                                      surplus >= 0
                                        ? 'text-emerald-400'
                                        : 'text-red-400',
                                    )}
                                  >
                                    {formatCurrency(Math.abs(surplus))}
                                  </span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                  </div>
                </Card>
              )}

              {/* Step 4 — Insurance */}
              {currentStep === 4 && (
                <Card>
                  <h2 className="text-lg font-semibold text-[#F0F0F5] mb-1">
                    Insurance Coverage
                  </h2>
                  <p className="text-sm text-[#8B8FA3] mb-6">
                    Existing disability, life, and long-term care policies
                  </p>

                  {[
                    {
                      title: 'Disability Insurance',
                      policies: plan?.disabilityInsurance.policies ?? [],
                    },
                    {
                      title: 'Life Insurance',
                      policies: plan?.lifeInsurance.policies ?? [],
                    },
                    {
                      title: 'Long-Term Care',
                      policies: plan?.longTermCare.policies ?? [],
                    },
                  ].map((section) => (
                    <div key={section.title} className="mb-6 last:mb-0">
                      <h3 className="text-sm font-medium text-[#C9A962] mb-3">
                        {section.title}
                      </h3>
                      {section.policies.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-[#1E2A45] p-4 text-center">
                          <p className="text-sm text-[#4A5068]">
                            No existing policies
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {section.policies.map((policy) => (
                            <div
                              key={policy.id}
                              className="rounded-xl border border-[#1E2A45] bg-[#0A0F1C]/50 p-4"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <p className="text-sm font-medium text-[#F0F0F5]">
                                    {policy.type}
                                  </p>
                                  <p className="text-xs text-[#8B8FA3]">
                                    {policy.owner} · #{policy.policyNumber}
                                  </p>
                                </div>
                                <Badge variant="default">{policy.premiumFrequency}</Badge>
                              </div>
                              <div className="grid grid-cols-3 gap-3 text-xs">
                                <div>
                                  <span className="text-[#4A5068]">Benefit</span>
                                  <p className="text-[#F0F0F5] font-medium mt-0.5">
                                    {formatCurrency(policy.benefit)}
                                    {section.title === 'Disability Insurance'
                                      ? '/mo'
                                      : ''}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-[#4A5068]">Premium</span>
                                  <p className="text-[#F0F0F5] font-medium mt-0.5">
                                    {formatCurrency(policy.premium)}/
                                    {policy.premiumFrequency === 'monthly'
                                      ? 'mo'
                                      : policy.premiumFrequency === 'quarterly'
                                        ? 'qtr'
                                        : 'yr'}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-[#4A5068]">
                                    Beneficiary
                                  </span>
                                  <p className="text-[#F0F0F5] font-medium mt-0.5">
                                    {policy.beneficiary}
                                  </p>
                                </div>
                              </div>
                              {policy.cashValue !== undefined && (
                                <div className="mt-2 pt-2 border-t border-[#1E2A45] text-xs">
                                  <span className="text-[#4A5068]">
                                    Cash Value:{' '}
                                  </span>
                                  <span className="text-[#C9A962] font-medium">
                                    {formatCurrency(policy.cashValue)}
                                  </span>
                                </div>
                              )}
                              {policy.waitingPeriod && (
                                <div className="mt-1 text-xs">
                                  <span className="text-[#4A5068]">
                                    Waiting Period:{' '}
                                  </span>
                                  <span className="text-[#8B8FA3]">
                                    {policy.waitingPeriod}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </Card>
              )}

              {/* Step 5 — Retirement */}
              {currentStep === 5 && (
                <Card>
                  <h2 className="text-lg font-semibold text-[#F0F0F5] mb-1">
                    Retirement Assets
                  </h2>
                  <p className="text-sm text-[#8B8FA3] mb-6">
                    Retirement accounts and savings goal
                  </p>

                  <div className="space-y-4">
                    {formData.retirementAccounts.map((acct, i) => (
                      <div
                        key={acct.id}
                        className="rounded-xl border border-[#1E2A45] bg-[#0A0F1C]/50 p-4"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="gold">{acct.type.toUpperCase()}</Badge>
                          <span className="text-sm font-medium text-[#F0F0F5] flex-1">
                            {acct.name || `Account ${i + 1}`}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <Input
                            label="Account Name"
                            value={acct.name}
                            onChange={(e) =>
                              updateRetirementAccount(i, 'name', e.target.value)
                            }
                          />
                          <Input
                            label="Balance"
                            type="number"
                            value={acct.balance}
                            onChange={(e) =>
                              updateRetirementAccount(i, 'balance', e.target.value)
                            }
                          />
                          <Input
                            label="Contribution Rate (%)"
                            type="number"
                            value={acct.contributionRate}
                            onChange={(e) =>
                              updateRetirementAccount(
                                i,
                                'contributionRate',
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-[#1E2A45]">
                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-[#8B8FA3]">
                        Total Retirement Savings
                      </span>
                      <span className="text-[#C9A962] font-semibold">
                        {formatCurrency(
                          formData.retirementAccounts.reduce(
                            (s, a) => s + (Number(a.balance) || 0),
                            0,
                          ),
                        )}
                      </span>
                    </div>
                    <Input
                      label="Retirement Goal"
                      type="number"
                      value={formData.retirementGoal}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          retirementGoal: e.target.value,
                        }))
                      }
                      placeholder="e.g. 1400000"
                    />
                    {formData.retirementGoal && (
                      <div className="mt-3">
                        <Progress
                          value={Math.min(
                            (formData.retirementAccounts.reduce(
                              (s, a) => s + (Number(a.balance) || 0),
                              0,
                            ) /
                              (Number(formData.retirementGoal) || 1)) *
                              100,
                            100,
                          )}
                          showLabel
                        />
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Step 6 — Estate Planning */}
              {currentStep === 6 && (
                <Card>
                  <h2 className="text-lg font-semibold text-[#F0F0F5] mb-1">
                    Estate Planning
                  </h2>
                  <p className="text-sm text-[#8B8FA3] mb-6">
                    Document completion status
                  </p>

                  <div className="space-y-3">
                    {formData.estateDocuments.map((doc, i) => (
                      <div
                        key={doc.name}
                        className={cn(
                          'flex items-center justify-between rounded-xl border p-4 transition-colors',
                          doc.completed
                            ? 'border-emerald-500/30 bg-emerald-500/5'
                            : 'border-[#1E2A45] bg-[#0A0F1C]/50',
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <ScrollText
                            className={cn(
                              'w-4 h-4',
                              doc.completed
                                ? 'text-emerald-400'
                                : 'text-[#4A5068]',
                            )}
                          />
                          <span
                            className={cn(
                              'text-sm font-medium',
                              doc.completed
                                ? 'text-[#F0F0F5]'
                                : 'text-[#8B8FA3]',
                            )}
                          >
                            {doc.name}
                          </span>
                        </div>
                        <button
                          onClick={() => toggleEstateDoc(i)}
                          className={cn(
                            'relative w-11 h-6 rounded-full transition-colors',
                            doc.completed ? 'bg-emerald-500' : 'bg-[#1E2A45]',
                          )}
                        >
                          <motion.div
                            className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
                            animate={{ left: doc.completed ? 22 : 2 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-[#1E2A45]">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[#8B8FA3]">Completion</span>
                      <span className="text-[#F0F0F5] font-medium">
                        {formData.estateDocuments.filter((d) => d.completed).length}{' '}
                        / {formData.estateDocuments.length} documents
                      </span>
                    </div>
                    <Progress
                      value={
                        (formData.estateDocuments.filter((d) => d.completed)
                          .length /
                          formData.estateDocuments.length) *
                        100
                      }
                      color={
                        formData.estateDocuments.filter((d) => d.completed)
                          .length === formData.estateDocuments.length
                          ? 'bg-emerald-500'
                          : 'bg-[#C9A962]'
                      }
                      showLabel
                    />
                  </div>
                </Card>
              )}

              {/* Step 7 — Risk Tolerance */}
              {currentStep === 7 && (
                <Card>
                  <h2 className="text-lg font-semibold text-[#F0F0F5] mb-1">
                    Risk Tolerance
                  </h2>
                  <p className="text-sm text-[#8B8FA3] mb-6">
                    Help us understand your investment comfort level
                  </p>

                  <div className="space-y-6">
                    <RiskQuestion
                      question="If your portfolio dropped 20% in value, you would..."
                      options={[
                        'Sell everything',
                        'Sell some holdings',
                        'Hold steady',
                        'Buy more',
                      ]}
                      value={formData.riskAnswers.dropReaction}
                      onChange={(v) => updateRisk('dropReaction', v)}
                    />

                    <RiskQuestion
                      question="Your primary investment goal is..."
                      options={[
                        'Preserve capital',
                        'Balanced growth',
                        'Maximize growth',
                        'Aggressive growth',
                      ]}
                      value={formData.riskAnswers.primaryGoal}
                      onChange={(v) => updateRisk('primaryGoal', v)}
                    />

                    <RiskQuestion
                      question="When do you need this money?"
                      options={[
                        '1-3 years',
                        '3-7 years',
                        '7-15 years',
                        '15+ years',
                      ]}
                      value={formData.riskAnswers.timeHorizon}
                      onChange={(v) => updateRisk('timeHorizon', v)}
                    />

                    <RiskQuestion
                      question="Your investment experience level:"
                      options={['None', 'Some', 'Experienced', 'Expert']}
                      value={formData.riskAnswers.experience}
                      onChange={(v) => updateRisk('experience', v)}
                    />
                  </div>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="secondary"
            onClick={goPrev}
            disabled={currentStep === 0}
            className={cn(currentStep === 0 && 'invisible')}
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex items-center gap-1.5">
            {STEP_LABELS.map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-2 h-2 rounded-full transition-colors',
                  i === currentStep
                    ? 'bg-[#C9A962]'
                    : i < currentStep
                      ? 'bg-emerald-500/50'
                      : 'bg-[#1E2A45]',
                )}
              />
            ))}
          </div>

          {currentStep < 7 ? (
            <Button onClick={goNext}>
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit}>
              <CheckCircle2 className="w-4 h-4" />
              Submit
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function RiskQuestion({
  question,
  options,
  value,
  onChange,
}: {
  question: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-[#F0F0F5] mb-3">{question}</p>
      <div className="grid grid-cols-2 gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={cn(
              'px-4 py-2.5 rounded-xl text-sm font-medium transition-all border text-left',
              value === opt
                ? 'bg-[#C9A962]/10 border-[#C9A962] text-[#C9A962]'
                : 'border-[#1E2A45] text-[#8B8FA3] hover:border-[#2E3A55] hover:text-[#F0F0F5]',
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function TrendingDown({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
      <polyline points="16 17 22 17 22 11" />
    </svg>
  );
}
