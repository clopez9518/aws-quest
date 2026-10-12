import React, { useState } from 'react';
import {
  Compass,
  Layers,
  Sparkles,
  BookOpen,
  Award,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  Cpu,
  ShieldCheck,
  Zap,
  HelpCircle
} from 'lucide-react';
import { useFocusTrap } from '../../../shared/hooks/useFocusTrap';

export interface OnboardingTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

interface TutorialStep {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  accentColor: 'amber' | 'sky' | 'emerald' | 'purple';
  highlights: Array<{
    title: string;
    desc: string;
    icon: React.ReactNode;
  }>;
  proTip?: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    badge: 'Bienvenida • Paso 1 de 4',
    title: 'Bienvenido a AWS Quest Architecture Arena',
    subtitle: 'La plataforma táctica para diseñar, resolver y dominar arquitecturas en AWS.',
    description:
      'Aquí no solo respondes preguntas teóricas: diseñas infraestructura real sobre un canvas interactivo, diagnosticas incidentes de producción y validas tus soluciones contra los 5 Pilares del AWS Well-Architected Framework.',
    icon: <Compass className="w-8 h-8 text-[#FF9900]" />,
    accentColor: 'amber',
    highlights: [
      {
        title: 'Entrenamiento Práctico',
        desc: 'Aprende conectando VPCs, subredes, EC2, ALBs, bases de datos y servicios serverless.',
        icon: <Cpu className="w-4 h-4 text-[#FF9900]" />
      },
      {
        title: 'Casos de Negocio Reales',
        desc: 'Cada misión responde a requisitos empresariales auténticos de alta disponibilidad y seguridad.',
        icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />
      },
      {
        title: 'Evaluación Well-Architected',
        desc: 'Tu diseño es evaluado con feedback pedagógico en seguridad, fiabilidad, costos, rendimiento y operaciones.',
        icon: <Sparkles className="w-4 h-4 text-sky-500" />
      }
    ],
    proTip: 'Puedes guardar tu progreso en la nube o jugar en modo invitado sin necesidad de registrarte inicialmente.'
  },
  {
    id: 'itinerary',
    badge: 'Currículo • Paso 2 de 4',
    title: 'Itinerario por Olas y Modos de Desafío',
    subtitle: 'Avanza progresivamente desde los fundamentos de red hasta arquitecturas distribuidas.',
    description:
      'El catálogo organiza los desafíos en 3 Olas de Aprendizaje estructuradas con dos modalidades de juego:',
    icon: <Layers className="w-8 h-8 text-sky-500" />,
    accentColor: 'sky',
    highlights: [
      {
        title: 'Modo Builder (Construcción)',
        desc: 'Comienzas con un lienzo en blanco para diseñar la topología que satisfaga todos los requisitos técnicos.',
        icon: <Zap className="w-4 h-4 text-amber-500" />
      },
      {
        title: 'Modo Fix Architecture (Reparación de Incidentes)',
        desc: 'Heredas una arquitectura rota o mal configurada. Tu objetivo es auditarla, identificar la falla y repararla.',
        icon: <HelpCircle className="w-4 h-4 text-rose-500" />
      },
      {
        title: '3 Olas Progresivas (12 Unidades)',
        desc: 'Ola 1: Redes y Cómputo Base. Ola 2: Alta Disponibilidad y Resiliencia. Ola 3: Serverless y Patrones Empresariales.',
        icon: <Layers className="w-4 h-4 text-sky-500" />
      }
    ],
    proTip: 'El sistema anti-farm evita que repitas sin aprender y premia los puntajes mayores a 70 puntos.'
  },
  {
    id: 'canvas',
    badge: 'El Canvas • Paso 3 de 4',
    title: 'Topología Interactiva & CIDR en Redes',
    subtitle: 'Construye arrastrando nodos, configurando subredes y conectando servicios.',
    description:
      'El canvas interactivo te da control total sobre la arquitectura cloud:',
    icon: <Cpu className="w-8 h-8 text-emerald-500" />,
    accentColor: 'emerald',
    highlights: [
      {
        title: 'VPCs y Subredes Inteligentes',
        desc: 'Crea subredes públicas o privadas con rangos CIDR (/16 a /28). El sistema valida solapamientos en tiempo real.',
        icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />
      },
      {
        title: 'Inspector Lateral de Nodos',
        desc: 'Selecciona cualquier nodo para editar sus propiedades, tipos de instancia, motores de base de datos o zonas.',
        icon: <Cpu className="w-4 h-4 text-sky-500" />
      },
      {
        title: 'Validación en Tiempo Real',
        desc: 'Al terminar, haz clic en "Validar Arquitectura" para que el motor evalúe tu solución y te asigne XP.',
        icon: <CheckCircle2 className="w-4 h-4 text-[#FF9900]" />
      }
    ],
    proTip: 'Al ingresar a cada desafío verás primero el Caso de Negocio y podrás consultar el Briefing Técnico o Glosario en cualquier momento.'
  },
  {
    id: 'tools',
    badge: 'Herramientas • Paso 4 de 4',
    title: 'Glosario Cloud & Sistema de Niveles',
    subtitle: 'Todo lo que necesitas para acelerar tu aprendizaje está a un clic.',
    description:
      'Tienes a tu disposición un ecosistema completo de soporte integrado en la consola:',
    icon: <Award className="w-8 h-8 text-purple-500" />,
    accentColor: 'purple',
    highlights: [
      {
        title: 'Spotlight del Diccionario (⌘K / Ctrl+K)',
        desc: 'Presiona el atajo para buscar servicios de AWS, definiciones técnicas y patrones Well-Architected al instante.',
        icon: <BookOpen className="w-4 h-4 text-purple-500" />
      },
      {
        title: 'Nivel y Progreso XP',
        desc: 'Acumula experiencia completando desafíos y desbloquea insignias de maestría arquitectónica.',
        icon: <Award className="w-4 h-4 text-[#FF9900]" />
      },
      {
        title: 'Reiniciar este Tutorial',
        desc: 'Puedes volver a abrir este tutorial en cualquier momento desde el botón de ayuda del encabezado.',
        icon: <Compass className="w-4 h-4 text-sky-500" />
      }
    ],
    proTip: '¡Todo listo, Arquitecto! Entra al Catálogo y selecciona tu primer desafío para comenzar tu aventura.'
  }
];

export const ONBOARDING_STORAGE_KEY = 'awsquest_onboarding_completed';

export function OnboardingTutorialModal({
  isOpen,
  onClose,
  onComplete
}: OnboardingTutorialModalProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const modalRef = useFocusTrap<HTMLDivElement>({ isOpen, onClose });

  if (!isOpen) return null;

  const currentStep = TUTORIAL_STEPS[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TUTORIAL_STEPS.length - 1;

  const handleFinish = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
      }
    } catch {
      // Ignorar errores de acceso a localStorage
    }
    if (onComplete) onComplete();
    onClose();
  };

  const handleNext = () => {
    if (isLastStep) {
      handleFinish();
    } else {
      setCurrentStepIndex((prev) => Math.min(prev + 1, TUTORIAL_STEPS.length - 1));
    }
  };

  const handlePrev = () => {
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-tutorial-title"
      data-testid="onboarding-tutorial-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        ref={modalRef}
        className="w-full max-w-2xl flex flex-col bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#374151] rounded-2xl shadow-2xl relative overflow-hidden transition-colors duration-200 max-h-[90vh]"
      >
        {/* Glow de fondo dinámico según paso */}
        <div
          className={`absolute -top-10 -right-10 w-56 h-56 rounded-full blur-3xl pointer-events-none transition-colors duration-500 ${
            currentStep.accentColor === 'amber'
              ? 'bg-[#FF9900]/15'
              : currentStep.accentColor === 'sky'
              ? 'bg-sky-500/15'
              : currentStep.accentColor === 'emerald'
              ? 'bg-emerald-500/15'
              : 'bg-purple-500/15'
          }`}
        />

        {/* Header del Modal */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-[#374151] bg-white/90 dark:bg-[#111827]/90 flex items-center justify-between shrink-0 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#171B26] border border-slate-200 dark:border-[#374151] flex items-center justify-center shadow-xs">
              {currentStep.icon}
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FF9900] dark:text-[#FFC082] block">
                {currentStep.badge}
              </span>
              <h2
                id="onboarding-tutorial-title"
                className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight"
              >
                {currentStep.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            data-testid="close-onboarding-tutorial"
            onClick={handleFinish}
            aria-label="Cerrar tutorial de bienvenida"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1F2937] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Indicador de Progreso por Pasos */}
        <div className="px-5 py-2.5 bg-slate-50 dark:bg-[#0B0F19] border-b border-slate-200 dark:border-[#374151] flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center space-x-2 flex-1">
            {TUTORIAL_STEPS.map((step, idx) => {
              const isActive = idx === currentStepIndex;
              const isPassed = idx < currentStepIndex;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer flex-1 ${
                    isActive
                      ? 'bg-[#FF9900] shadow-glow-amber/40 ring-2 ring-[#FF9900]/30'
                      : isPassed
                      ? 'bg-amber-400/60 dark:bg-amber-500/40'
                      : 'bg-slate-200 dark:bg-[#1F2937]'
                  }`}
                  aria-label={`Ir al paso ${idx + 1}: ${step.title}`}
                  aria-current={isActive ? 'step' : undefined}
                />
              );
            })}
          </div>
          <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400 shrink-0 ml-2">
            {currentStepIndex + 1} / {TUTORIAL_STEPS.length}
          </span>
        </div>

        {/* Contenido del Paso */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-sm relative z-10 flex-1 custom-scrollbar">
          <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
            {currentStep.subtitle}
          </p>

          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {currentStep.description}
          </p>

          {/* Tarjetas de Puntos Clave */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {currentStep.highlights.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#171B26] border border-slate-200 dark:border-[#374151] flex flex-col justify-between shadow-xs hover:border-slate-300 dark:hover:border-slate-500 transition-colors"
              >
                <div>
                  <div className="w-7 h-7 rounded-lg bg-white dark:bg-[#1F2937] border border-slate-200 dark:border-[#374151] flex items-center justify-center mb-2 shadow-inner">
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100 mb-1 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Tip de Arquitecto */}
          {currentStep.proTip && (
            <div className="p-3 sm:p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start space-x-2.5">
              <Sparkles className="w-4 h-4 text-[#FF9900] shrink-0 mt-0.5" />
              <p className="text-[11px] sm:text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <strong className="text-amber-800 dark:text-amber-300 font-bold">Consejo de Arquitecto: </strong>
                {currentStep.proTip}
              </p>
            </div>
          )}
        </div>

        {/* Footer de Controles */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-[#374151] bg-white/90 dark:bg-[#111827]/90 flex items-center justify-between gap-3 shrink-0 relative z-10">
          <button
            type="button"
            data-testid="skip-onboarding-tutorial"
            onClick={handleFinish}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer px-2 py-1"
          >
            Saltar tutorial
          </button>

          <div className="flex items-center space-x-2">
            {!isFirstStep && (
              <button
                type="button"
                data-testid="prev-step-onboarding"
                onClick={handlePrev}
                className="inline-flex items-center px-3.5 py-2 rounded-xl border border-slate-300 dark:border-[#374151] bg-white dark:bg-[#1F2937] hover:bg-slate-100 dark:hover:bg-[#262A35] text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                <span>Anterior</span>
              </button>
            )}

            <button
              type="button"
              data-testid="next-step-onboarding"
              onClick={handleNext}
              className="inline-flex items-center px-5 py-2 rounded-xl font-bold text-xs bg-[#FF9900] hover:bg-[#FFAC1C] active:bg-[#E68A00] text-slate-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <span>{isLastStep ? '¡Comenzar Desafíos!' : 'Siguiente'}</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
