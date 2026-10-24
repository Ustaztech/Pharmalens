"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, Camera, CircleHelp, FileWarning, History, Home, LayoutDashboard, Settings, UserRound, Users } from "@/components/icons";
import { Logo } from "@/components/logo";
import { clsx } from "clsx";
import { useEffect, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const desktopLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/scan", label: "Scan package", icon: Camera },
  { href: "/history", label: "Scan history", icon: History },
  { href: "/catalogue", label: "Catalogue", icon: BookOpen },
  { href: "/reports", label: "Reports", icon: FileWarning },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/help", label: "Help", icon: CircleHelp },
];

const mobileLinks = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/scan", label: "Scan", icon: Camera },
  { href: "/history", label: "History", icon: History },
  { href: "/profile", label: "Profile", icon: UserRound },
];

function NavLink({ href, label, icon: Icon, mobile = false }: (typeof desktopLinks)[number] & { mobile?: boolean }) {
  const path = usePathname();
  const active = path === href || path.startsWith(`${href}/`);
  return <Link className={clsx(mobile ? "mobile-nav-link" : "side-link", active && "active")} href={href} aria-current={active ? "page" : undefined}><Icon size={mobile ? 22 : 19} /><span>{label}</span></Link>;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const router=useRouter();
  const [email,setEmail]=useState("");
  const [role,setRole]=useState<"user"|"reviewer"|"admin">("user");
  useEffect(()=>{if(!isSupabaseConfigured())return;const supabase=createClient();supabase.auth.getUser().then(async({data})=>{setEmail(data.user?.email??"");if(data.user){const {data:profile}=await supabase.from("profiles").select("role").eq("id",data.user.id).single();setRole(profile?.role??"user")}});const {data}=supabase.auth.onAuthStateChange((_event,session)=>setEmail(session?.user.email??""));return()=>data.subscription.unsubscribe()},[]);
  async function signOut(){if(!isSupabaseConfigured())return;await createClient().auth.signOut();setEmail("");router.push("/");router.refresh()}
  return (
    <div className="app-frame">
      <aside className="sidebar">
        <Logo />
        <nav aria-label="Main navigation">{desktopLinks.map((link) => <NavLink key={link.href} {...link} />)}{(role==="reviewer"||role==="admin")&&<NavLink href="/review" label="Review queue" icon={FileWarning}/>} {role==="admin"&&<NavLink href="/admin" label="Administration" icon={Users}/>}</nav>
        <div className="sidebar-note"><span>Screening, not certification</span><p>Images cannot confirm authenticity, quality or safety.</p></div>
      </aside>
      <div className="app-main">
        <header className="app-topbar"><div><span className="eyebrow">PharmaLens workspace</span><strong>Preliminary package screening</strong></div><div className="account-area"><Link className="account-chip" href="/profile"><span>{email?email.slice(0,2).toUpperCase():"GU"}</span><div><strong>{email||"Guest user"}</strong><small>{email?"Private cloud history":"Device-only history"}</small></div></Link>{email&&<button onClick={signOut} className="signout" aria-label="Log out">Log out</button>}</div></header>
        <main className="app-content">{children}</main>
      </div>
      <nav className="mobile-nav" aria-label="Mobile navigation">{mobileLinks.map((link) => <NavLink key={link.href} {...link} mobile />)}</nav>
    </div>
  );
}
