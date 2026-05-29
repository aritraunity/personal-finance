"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";

interface SidebarProps {
  onClose?: () => void;
}

const NAV = [
  { href: "/", label: "Transactions", icon: "receipt_long" },
  { href: "/budgets", label: "Budgets", icon: "savings" },
];

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600 shadow-sm shadow-indigo-200">
          <Icon name="account_balance_wallet" size={18} className="text-white" filled />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900 tracking-tight">Finance Tracker</p>
          <p className="text-xs text-slate-400">Personal finance</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors lg:hidden"
          >
            <Icon name="close" size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="px-2 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Menu
        </p>
        {NAV.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon
                name={icon}
                size={20}
                filled={active}
                className={active ? "text-indigo-600" : "text-slate-400"}
              />
              {label}
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-100">
        <p className="text-xs text-slate-400">
          {new Date().toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}
