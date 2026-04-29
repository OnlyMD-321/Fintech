"use client";

import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CompactSelect } from "@/components/ui/compact-select";
import { useActiveProfile, useAppStore } from "@/store/app-store";
import { ShieldCheck, Users, Search, Plus, ArrowLeft, HeartPulse, Loader2, AlertCircle } from "lucide-react";
import type { InsuranceCoverage } from "@/services/mock-data";

export function InsuranceScreen({ view }: { view: "list" | "create" }) {
  const profile = useActiveProfile();
  
  // Import de setActiveTab pour naviguer via le store global
  const { toggleInsuranceStatus, addInsurance, setActiveTab } = useAppStore();

  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Formulaire d'affiliation
  const [employeeName, setEmployeeName] = useState("");
  const [role, setRole] = useState("");
  const [coverageType, setCoverageType] = useState<InsuranceCoverage>("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const insurances = profile?.employeeInsurances || [];

  const filteredInsurances = useMemo(() => {
    if (!searchQuery) return insurances;
    return insurances.filter(ins => 
      ins.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      ins.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [insurances, searchQuery]);

  const activeCount = useMemo(() => insurances.filter(i => i.status === "active").length, [insurances]);
  
  const totalMonthlyPremium = useMemo(() => 
    insurances.filter(i => i.status === "active").reduce((sum, i) => sum + i.premium, 0), 
  [insurances]);

  if (!isMounted || !profile) return null;

  const handleAddEmployee = () => {
    if (!employeeName || !role) return;

    setIsSubmitting(true);
    setTimeout(async () => {
      const premium = coverageType === "basic" ? 250 : coverageType === "premium" ? 450 : 850;
      
      await addInsurance({
        employeeName,
        role,
        coverageType,
        premium,
        status: "active",
        startDate: new Date().toISOString()
      });

      setEmployeeName("");
      setRole("");
      setCoverageType("basic");
      setIsSubmitting(false);
      
      // Retour à la liste via le menu global
      setActiveTab("insurances");
    }, 800);
  };

  const getCoverageBadge = (type: string) => {
    switch (type) {
      case "executive": return <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase">Executive</span>;
      case "premium": return <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase">Premium</span>;
      default: return <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase">Basic</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <span className="text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full text-[10px] font-medium">Couvert</span>;
      case "pending": return <span className="text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full text-[10px] font-medium">En attente</span>;
      case "suspended": return <span className="text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full text-[10px] font-medium">Suspendu</span>;
      default: return null;
    }
  };

  // ==========================================
  // VUE 1 : DASHBOARD DES ASSURANCES (LISTE)
  // ==========================================
  if (view === "list") {
    return (
      <section className="space-y-4 animate-floatIn md:space-y-5">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold leading-tight md:text-2xl">Assurance Santé</h1>
            <p className="text-sm text-[#6B7280]">Gérez la mutuelle et les affiliations de vos employés.</p>
          </div>
          <Button onClick={() => setActiveTab("insurances-create")} className="flex items-center gap-2 shadow-md bg-[#3730A3] hover:bg-[#312E81]">
            <Plus size={16} /> Affilier un employé
          </Button>
        </header>

        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-white space-y-1">
            <p className="text-xs font-medium text-[#6B7280] flex items-center gap-1.5"><Users size={14} className="text-[#3730A3]" /> Employés couverts</p>
            <p className="text-2xl font-bold text-[#111827]">{activeCount} <span className="text-sm font-normal text-gray-500">/ {insurances.length}</span></p>
          </Card>
          <Card className="bg-white space-y-1">
            <p className="text-xs font-medium text-[#6B7280] flex items-center gap-1.5"><ShieldCheck size={14} className="text-[#16A34A]" /> Prime mensuelle</p>
            <p className="text-2xl font-bold text-[#111827]">{totalMonthlyPremium.toLocaleString("fr-MA")} <span className="text-sm font-normal text-gray-500">{profile.currency}</span></p>
          </Card>
        </div>

        <Card className="bg-white p-0 overflow-hidden">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" size={15} />
              <input 
                type="text"
                placeholder="Rechercher un employé ou un poste..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-border bg-[#F8FAFC] py-2 pl-9 pr-3 text-sm text-[#111827] outline-none transition-all focus:border-[#3730A3] focus:ring-1 focus:ring-[#3730A3]"
              />
            </div>
          </div>
          
          <ul className="divide-y divide-gray-100">
            {filteredInsurances.length > 0 ? (
              filteredInsurances.map((ins) => (
                <li key={ins.id} className="p-4 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-blue-50 text-indigo-700 font-bold text-sm shrink-0">
                      {ins.employeeName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">{ins.employeeName}</p>
                        {getStatusBadge(ins.status)}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{ins.role}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 sm:w-[250px]">
                    <div className="flex flex-col items-start sm:items-end">
                      {getCoverageBadge(ins.coverageType)}
                      <p className="text-xs font-medium text-gray-900 mt-1">{ins.premium} {profile.currency} / mois</p>
                    </div>
                    
                    <button
                      onClick={() => toggleInsuranceStatus(ins.id)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                        ins.status === "active" 
                          ? "border-red-200 text-red-600 hover:bg-red-50" 
                          : "border-green-200 text-green-600 hover:bg-green-50"
                      }`}
                    >
                      {ins.status === "active" ? "Suspendre" : "Activer"}
                    </button>
                  </div>
                </li>
              ))
            ) : (
              <div className="text-center py-10">
                <HeartPulse size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">Aucun employé trouvé.</p>
              </div>
            )}
          </ul>
        </Card>
      </section>
    );
  }

  // ==========================================
  // VUE 2 : FORMULAIRE D'AFFILIATION
  // ==========================================
  return (
    <section className="space-y-3 animate-slideInRight md:space-y-4">
      <button 
        onClick={() => setActiveTab("insurances")} 
        className="flex items-center text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors mb-2"
      >
        <ArrowLeft size={16} className="mr-1.5" /> Retour aux assurances
      </button>

      <header>
        <h1 className="text-xl font-semibold leading-tight md:text-2xl">Nouvelle affiliation</h1>
        <p className="text-sm text-[#6B7280]">Ajoutez un nouvel employé à votre couverture mutuelle d'entreprise.</p>
      </header>

      <div className="grid gap-3 md:grid-cols-2">
        <Card className="space-y-4 md:p-5 bg-white">
          <div>
            <Label htmlFor="employeeName">Nom complet de l'employé</Label>
            <Input 
              id="employeeName" 
              placeholder="Ex: Ahmed Bennani" 
              value={employeeName} 
              onChange={(e) => setEmployeeName(e.target.value)} 
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="role">Poste occupé</Label>
            <Input 
              id="role" 
              placeholder="Ex: Développeur Fullstack" 
              value={role} 
              onChange={(e) => setRole(e.target.value)} 
              className="mt-1"
            />
          </div>
        </Card>

        <Card className="space-y-4 md:p-5 bg-white">
          <div>
            <Label>Formule de couverture</Label>
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

          <div className="rounded-xl bg-[#F8FAFC] p-3 flex gap-3 border border-border">
             <AlertCircle className="text-[#3730A3] shrink-0 mt-0.5" size={16} />
             <div>
               <p className="text-sm font-medium text-[#111827]">Prélèvement automatique</p>
               <p className="text-xs text-[#6B7280] mt-0.5">La prime mensuelle sera prélevée automatiquement sur votre solde global le 1er de chaque mois.</p>
             </div>
          </div>

          <Button fullWidth className="h-10.5 shadow-md bg-[#3730A3] hover:bg-[#312E81]" onClick={handleAddEmployee} disabled={isSubmitting || !employeeName || !role}>
            {isSubmitting ? <Loader2 className="animate-spin mr-2" size={16} /> : <ShieldCheck className="mr-2" size={16} />}
            {isSubmitting ? "Enregistrement..." : "Confirmer l'affiliation"}
          </Button>
        </Card>
      </div>
    </section>
  );
}