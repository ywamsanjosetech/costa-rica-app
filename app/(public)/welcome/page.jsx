"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Aurora from "@/components/ui/aurora";
import CountUp from "@/components/ui/count-up";
import GlassSurface from "@/components/ui/glass-surface";

const ADMIN_PASSCODE = "CostaRica#2020";

export default function WelcomePage() {
  const router = useRouter();
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState("");
  const [adminError, setAdminError] = useState("");

  useEffect(() => {
    document.body.classList.add("welcome-no-bg");
    return () => document.body.classList.remove("welcome-no-bg");
  }, []);

  useEffect(() => {
    if (!isAdminModalOpen) return;

    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setIsAdminModalOpen(false);
        setAdminPasscode("");
        setAdminError("");
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isAdminModalOpen]);

  const handleAdminSubmit = (event) => {
    event.preventDefault();

    if (adminPasscode === ADMIN_PASSCODE) {
      setAdminError("");
      setIsAdminModalOpen(false);
      setAdminPasscode("");
      router.push("/admin/dashboard");
      return;
    }

    setAdminError("Código incorrecto. Inténtalo de nuevo.");
  };

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden">
      <div className="fixed inset-0">
        <Aurora
          colorStops={["#3346d7", "#a3f0ef", "#eef2f7"]}
          blend={0.5}
          amplitude={1.0}
          speed={1}
        />
      </div>

      <div className="relative z-10 flex w-full justify-center px-3 pt-10 pb-12 sm:px-4 sm:pt-12 sm:pb-20">
        <div className="flex w-full max-w-[920px] flex-col items-center gap-4">
          <GlassSurface
            width="100%"
            height="clamp(118px, 16vw, 156px)"
            borderRadius={28}
            displace={0.5}
            distortionScale={-180}
            redOffset={0}
            greenOffset={10}
            blueOffset={20}
            brightness={50}
            opacity={0.93}
            mixBlendMode="screen"
            className="shadow-[0_16px_40px_-22px_rgba(0,0,0,0.55)]"
          >
            <div className="relative flex h-full w-full flex-col items-center justify-center gap-1 px-3 text-white/90 sm:px-4 md:px-6">
              <p className="text-[0.76rem] font-semibold uppercase tracking-[0.24em] text-white/52 sm:text-[0.9rem]">
                YWAM San José Costa Rica
              </p>
              <div className="relative inline-block">
                <p className="wordmark-luxe text-center text-[1.34rem] leading-tight font-semibold tracking-[0.045em] whitespace-nowrap text-white sm:text-[1.9rem] md:text-[2.3rem]">
                  <span className="wordmark-luxe-accent">
                    Evaluación de Vivienda YWAM
                  </span>
                </p>
              </div>
            </div>
          </GlassSurface>

          <div className="flex w-full max-w-xl gap-4 sm:max-w-2xl">
            <button
              type="button"
              onClick={() => {
                setAdminError("");
                setAdminPasscode("");
                setIsAdminModalOpen(true);
              }}
              className="group relative flex-1 overflow-hidden rounded-2xl border border-white/55 bg-white/16 px-7 py-4 text-center text-xl font-semibold tracking-[0.06em] text-white backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.02] hover:border-white/80 hover:bg-white/24 hover:shadow-[0_18px_36px_-14px_rgba(255,255,255,0.75)] active:scale-[0.98]"
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/18 to-transparent transition-transform duration-500 ease-out group-hover:translate-x-full" />
              <span className="relative z-10 inline-flex items-center justify-center gap-2">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  className="h-5 w-5"
                  aria-hidden
                >
                  <rect x="5" y="11" width="14" height="10" rx="2" />
                  <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                </svg>
                ADMIN
              </span>
            </button>
            <Link
              href="/apply/housing-relief-2026"
              className="group relative flex-1 overflow-hidden rounded-2xl border border-white/55 bg-white/16 px-7 py-4 text-center text-xl font-semibold tracking-[0.06em] text-white backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.02] hover:border-white/80 hover:bg-white/24 hover:shadow-[0_18px_36px_-14px_rgba(255,255,255,0.75)] active:scale-[0.98]"
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/18 to-transparent transition-transform duration-500 ease-out group-hover:translate-x-full" />
              <span className="relative z-10">FORMULARIO</span>
            </Link>
          </div>

          <div className="grid w-full max-w-5xl gap-6 pt-4 sm:grid-cols-3 sm:gap-8">
            <article className="px-2 py-2 text-center">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-white/65 sm:text-base">
                Vivienda
              </p>
              <div className="relative mt-1 inline-flex min-w-[120px] justify-center sm:min-w-[180px]">
                <p className="relative text-[3rem] leading-none font-semibold tracking-tight text-pink-soft sm:text-[5.2rem]">
                  +<CountUp from={0} to={200} duration={1.2} startWhen={true} separator="," />
                </p>
              </div>
              <p className="mt-1 text-[0.85rem] font-medium uppercase tracking-[0.1em] text-pink-soft/90 sm:text-base sm:tracking-[0.12em]">
                Hogares construidos
              </p>
            </article>

            <article className="px-2 py-2 text-center">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-white/65 sm:text-base">
                Impacto
              </p>
              <div className="relative mt-1 inline-flex min-w-[120px] justify-center sm:min-w-[180px]">
                <p className="relative text-[3rem] leading-none font-semibold tracking-tight text-teal sm:text-[5.2rem]">
                  +<CountUp from={0} to={480} duration={1.3} startWhen={true} separator="," />
                </p>
              </div>
              <p className="mt-1 text-[0.85rem] font-medium uppercase tracking-[0.1em] text-teal/90 sm:text-base sm:tracking-[0.12em]">
                Familias transformadas
              </p>
            </article>

            <article className="px-2 py-2 text-center">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-white/65 sm:text-base">
                Movilizacion
              </p>
              <div className="relative mt-1 inline-flex min-w-[120px] justify-center sm:min-w-[180px]">
                <p className="relative text-[3rem] leading-none font-semibold tracking-tight text-green sm:text-[5.2rem]">
                  +<CountUp from={0} to={1600} duration={1.5} startWhen={true} separator="," />
                </p>
              </div>
              <p className="mt-1 text-[0.85rem] font-medium uppercase tracking-[0.1em] text-green/90 sm:text-base sm:tracking-[0.12em]">
                Voluntarios
              </p>
            </article>

            <div className="flex flex-col items-center pt-4 pb-8 sm:col-span-3 sm:pt-8 sm:pb-12">
              <p className="wordmark-luxe-accent text-center text-[0.84rem] font-semibold uppercase tracking-[0.14em] sm:text-[1rem]">
                Escanea para abrir el formulario
              </p>
              <Link
                href="/apply/housing-relief-2026"
                aria-label="Abrir formulario de evaluación"
                className="mt-5 inline-block transition duration-300 hover:scale-[1.02]"
              >
                <Image
                  src="/QR_code_for_mobile_English_Wikipedia.svg"
                  alt="Código QR para abrir el formulario"
                  width={520}
                  height={520}
                  className="h-[310px] w-[310px] rounded-3xl bg-white p-3 sm:h-[430px] sm:w-[430px]"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {isAdminModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-white/35 bg-[#0f1e38]/88 p-5 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.8)] sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
              Acceso administrativo
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-white sm:text-[1.75rem]">
              Ingresa el código
            </h3>

            <form onSubmit={handleAdminSubmit} className="mt-5 space-y-3">
              <input
                type="password"
                value={adminPasscode}
                onChange={(event) => {
                  setAdminPasscode(event.target.value);
                  if (adminError) setAdminError("");
                }}
                autoFocus
                className="w-full rounded-xl border border-white/35 bg-black/35 px-4 py-3 text-base text-white outline-none transition focus:border-white/70"
                placeholder="Código de acceso"
              />

              {adminError ? (
                <p className="text-sm font-medium text-[#ffb6b6]">{adminError}</p>
              ) : null}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdminModalOpen(false);
                    setAdminPasscode("");
                    setAdminError("");
                  }}
                  className="flex-1 rounded-xl border border-white/35 bg-white/10 px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-white/16"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl border border-white/60 bg-white/20 px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-white/28"
                >
                  Continuar
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}
