"use client";

import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CompactSelect } from "@/components/ui/compact-select";
import { useActiveProfile, useAppStore } from "@/store/app-store";
import { ShieldCheck, Users, Search, Plus, ArrowLeft, HeartPulse, Loader2, AlertCircle } from "lucide-react";
// Ensure this type is exported from your mock-data file as shown in step 1
import type { InsuranceCoverage } from "@/services/mock-data";
import { cn } from "@/lib/utils";

export function InsuranceScreen({ view }: { view: "list" | "create" }) {
  const profile = useActiveProfile();
  
  const { toggleInsuranceStatus, addInsurance, setActiveTab } = useAppStore();

  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [employeeName, setEmployeeName] = useState("");
  const [role, setRole] = useState("");
  const [coverageType, setCoverageType] = useState<InsuranceCoverage>("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Using optional chaining and fallback to empty array to prevent build crashes
  const insurances = (profile as any)?.employeeInsurances || [];

  const filteredInsurances = useMemo(() => {
    if (!searchQuery) return insurances;
    return insurances.filter((ins: any) => 
      ins.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      ins.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [insurances, searchQuery]);

  const activeCount = useMemo(() => insurances.filter((i: any) => i.status === "active").length, [insurances]);
  
  const totalMonthlyPremium = useMemo(() => 
    insurances.filter((i: any) => i.status === "active").reduce((sum: number, i: any) => sum + i.premium, 0), 
  [insurances]);

  if (!isMounted || !profile) return null;

  const handleAddEmployee = () => {
    if (!employeeName || !role) return;

    setIsSubmitting(true);
    setTimeout(async () => {
      const premium = coverageType === "basic" ? 250 : coverageType === "premium" ? 450 : 850;
      
      if (addInsurance) {
        await addInsurance({
          employeeName,
          role,
          coverageType,
          premium,
          status: "active",
          startDate: new Date().toISOString()
        });
      }

      setEmployeeName("");
      setRole("");
      setCoverageType("basic");
      setIsSubmitting(false);
      setActiveTab("insurances");
    }, 800);
  };

  const getCoverageBadge = (type: string) => {
    switch (type) {
      case "executive": return <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">Executive</span>;
      case "premium": return <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">Premium</span>;
      default: return <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">Basic</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <span className="text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Couvert</span>;
      case "pending": return <span className="text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">En attente</span>;
      case "suspended": return <span className="text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Suspendu</span>;
      default: return null;
    }
  };

  if (view === "list") {
    return (
      <section className="animate-floatIn space-y-5 pb-20 md:pb-6">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white md:bg-transparent p-4 md:p-0 rounded-2xl md:rounded-none shadow-sm md:shadow-none border border-slate-100 md:border-none">
          <div>
            <h1 className="text-xl font-black text-slate-900 md:text-2xl">Assurance Santé</h1>
            <p className="text-sm text-slate-500 mt-1">Gérez la mutuelle et les affiliations de vos employés.</p>
          </div>
          <Button onClick={() => setActiveTab("insurances-create")} className="w-full sm:w-auto h-11 flex items-center gap-2 shadow-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus size={18} /> Affilier un employé
          </Button>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="p-5 lg:p-6 bg-white border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Users size={16} />
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Employés couverts</p>
            </div>
            <p className="text-3xl font-black text-slate-900">
              {activeCount} <span className="text-base font-bold text-slate-400">/ {insurances.length}</span>
            </p>
          </Card>

          <Card className="p-5 lg:p-6 bg-white border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                <ShieldCheck size={16} />
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Prime mensuelle</p>
            </div>
            <p className="text-3xl font-black text-slate-900">
              {totalMonthlyPremium.toLocaleString("fr-MA")} <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">{profile.currency}</span>
            </p>
          </Card>
        </div>

        <Card className="bg-white p-0 overflow-hidden border-slate-100 shadow-sm">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <div className="relative max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text"
                placeholder="Rechercher un employé ou un poste..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 shadow-sm"
              />
            </div>
          </div>
          
          <ul className="divide-y divide-slate-100">
            {filteredInsurances.length > 0 ? (
              filteredInsurances.map((ins: any) => (
                <li key={ins.id} className="p-4 sm:p-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-blue-50 text-indigo-700 font-black text-lg shrink-0 shadow-sm">
                      {ins.employeeName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold text-slate-900">{ins.employeeName}</p>
                        {getStatusBadge(ins.status)}
                      </div>
                      <p className="text-xs font-medium text-slate-500">{ins.role}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 sm:w-[280px]">
                    <div className="flex flex-col items-start sm:items-end gap-1">
                      {getCoverageBadge(ins.coverageType)}
                      <p className="text-xs font-bold text-slate-900">{ins.premium} {profile.currency} <span className="text-[10px] text-slate-400 font-medium">/ mois</span></p>
                    </div>
                    
                    <button
                      onClick={() => toggleInsuranceStatus && toggleInsuranceStatus(ins.id)}
                      className={cn(
                        "text-xs font-bold px-4 py-2 rounded-xl border-2 transition-all active:scale-95",
                        ins.status === "active" 
                          ? "border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200" 
                          : "border-green-100 text-green-600 hover:bg-green-50 hover:border-green-200"
                      )}
                    >
                      {ins.status === "active" ? "Suspendre" : "Activer"}
                    </button>
                  </div>
                </li>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                   <HeartPulse size={24} className="text-slate-300" />
                </div>
                <p className="text-sm font-medium text-slate-500">Aucun employé trouvé.</p>
              </div>
            )}
          </ul>
        </Card>
      </section>
    );
  }

  return (
    <section className="animate-slideInRight space-y-5 pb-20 md:pb-6">
      <button 
        onClick={() => setActiveTab("insurances")} 
        className="flex items-center text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors mb-2"
      >
        <ArrowLeft size={16} className="mr-1.5" /> Retour
      </button>

      <header className="bg-white md:bg-transparent p-4 md:p-0 rounded-2xl md:rounded-none shadow-sm md:shadow-none border border-slate-100 md:border-none">
        <h1 className="text-xl font-black text-slate-900 md:text-2xl">Nouvelle affiliation</h1>
        <p className="text-sm text-slate-500 mt-1">Ajoutez un nouvel employé à votre couverture mutuelle d'entreprise.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5 lg:p-6 bg-white border-slate-100 shadow-sm space-y-5">
          <div>
            <Label htmlFor="employeeName" className="text-xs font-bold uppercase text-slate-500 tracking-wider">Nom complet de l'employé</Label>
            <Input 
              id="employeeName" 
              placeholder="Ex: Ahmed Bennani" 
              value={employeeName} 
              onChange={(e) => setEmployeeName(e.target.value)} 
              className="mt-1.5 h-11 text-sm font-medium shadow-sm"
            />
          </div>
          <div>
            <Label htmlFor="role" className="text-xs font-bold uppercase text-slate-500 tracking-wider">Poste occupé</Label>
            <Input 
              id="role" 
              placeholder="Ex: Développeur Fullstack" 
              value={role} 
              onChange={(e) => setRole(e.target.value)} 
              className="mt-1.5 h-11 text-sm font-medium shadow-sm"
            />
          </div>
        </Card>

        <Card className="p-5 lg:p-6 bg-white border-slate-100 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-5">
            <div>
              <Label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Formule de couverture</Label>
              <div className="mt-1.5">
                <CompactSelect
                  value={coverageType}
                  onChange={(val) => setCoverageType(val as InsuranceCoverage)}
                  options={[
                    { label: "Formule Basic (250 MAD/mois)", value: "basic" },
                    { label: "Formule Premium (450 MAD/mois)", value: "premium" },
                    { label: "Formule Executive (850 MAD/mois)", value: "executive" }
                  ]}
                />
              </div>
            </div>

            <div className="rounded-xl bg-indigo-50/50 p-4 flex gap-3 border border-indigo-100">
               <AlertCircle className="text-indigo-600 shrink-0" size={18} />
               <div>
                 <p className="text-sm font-bold text-indigo-900">Prélèvement automatique</p>
                 <p className="text-xs font-medium text-indigo-700/80 mt-1 leading-relaxed">La prime mensuelle sera prélevée automatiquement sur votre solde global le 1er de chaque mois.</p>
               </div>
            </div>
          </div>

          <Button 
            className="h-12 text-sm shadow-md font-bold bg-indigo-600 hover:bg-indigo-700 text-white mt-4 w-full" 
            onClick={handleAddEmployee} 
            disabled={isSubmitting || !employeeName || !role}
          >
            {isSubmitting ? <Loader2 className="animate-spin mr-2" size={18} /> : <ShieldCheck className="mr-2" size={18} />}
            {isSubmitting ? "Enregistrement..." : "Confirmer l'affiliation"}
          </Button>
        </Card>
      </div>
    </section>
  );
}