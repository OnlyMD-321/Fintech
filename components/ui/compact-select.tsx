"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

type SelectOption = {
  label: string;
  value: string;
};

type CompactSelectProps = {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
};

export function CompactSelect({ value, options, onChange }: CompactSelectProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null); // <-- NOUVELLE RÉFÉRENCE POUR LE MENU

  const selectedLabel = options.find((option) => option.value === value)?.label ?? value;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      // On ferme SEULEMENT si on clique à l'extérieur du bouton ET à l'extérieur de la liste (Portal)
      const isOutsideRoot = rootRef.current && !rootRef.current.contains(event.target as Node);
      const isOutsideMenu = menuRef.current && !menuRef.current.contains(event.target as Node);

      if (isOutsideRoot && isOutsideMenu) {
        setOpen(false);
      }
    }

    function handleScroll(event: Event) {
      // Si on est en train de scroller À L'INTÉRIEUR de notre liste, on ne ferme pas le menu !
      if (menuRef.current && menuRef.current.contains(event.target as Node)) {
        return;
      }
      // Sinon (scroll de la page ou de la modale derrière), on le ferme pour qu'il ne flotte pas dans le vide
      setOpen(false);
    }

    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true); 
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
    };
  }, [open]);

  // Calcule la position exacte du bouton pour placer la liste en dessous
  const toggleOpen = () => {
    if (!open && rootRef.current) {
      const rect = rootRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 6,
        left: rect.left,
        width: rect.width,
      });
    }
    setOpen((prev) => !prev);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={toggleOpen}
        className="flex h-11 w-full items-center justify-between rounded-xl border border-border bg-white px-3 text-left text-sm text-foreground outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
      >
        <span>{selectedLabel}</span>
        <ChevronDown size={16} className={open ? "rotate-180 text-[#6B7280] transition" : "text-[#9CA3AF] transition"} />
      </button>

      {/* PORTAL : On téléporte la liste dans le body avec un Z-Index ultra élevé */}
      {open && mounted && createPortal(
        <ul 
          ref={menuRef} // <-- ATTACHEMENT DE LA NOUVELLE RÉFÉRENCE ICI
          style={{
            position: "fixed",
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            width: `${coords.width}px`,
          }}
          className="z-[9999] max-h-[220px] overflow-y-auto rounded-xl border border-border bg-white p-1 shadow-soft animate-in fade-in zoom-in-95"
        >
          {options.map((option) => {
            const isActive = option.value === value;
            return (
              <li key={option.value}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation(); // Évite tout conflit lors du clic
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={
                    isActive
                      ? "flex w-full items-center justify-between rounded-lg bg-[#EEF2FF] px-2.5 py-2 text-sm font-medium text-[#3730A3]"
                      : "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm text-foreground hover:bg-[#F3F4F6]"
                  }
                >
                  {option.label}
                  {isActive && <Check size={14} />}
                </button>
              </li>
            );
          })}
        </ul>,
        document.body
      )}
    </div>
  );
}