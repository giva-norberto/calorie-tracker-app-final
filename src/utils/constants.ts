// src/utils/constants.ts

// Cores do tema
export const COLORS = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },
} as const;

// Breakpoints responsivos
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Configurações de animação
export const ANIMATIONS = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
} as const;

// Configurações de z-index
export const Z_INDEX = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  popover: 1050,
  tooltip: 1060,
  toast: 1070,
} as const;

// ==================================================================
// || BLOCO DE CÓDIGO ADICIONADO PARA CORRIGIR O ERRO DE BUILD ||
// ==================================================================
// Fatores de Nível de Atividade (TMB Multiplier)
export const activityFactors = {
  sedentary: 1.2,       // Sedentário (pouco ou nenhum exercício)
  light: 1.375,         // Levemente ativo (exercício leve 1-3 dias/semana)
  moderate: 1.55,       // Moderadamente ativo (exercício moderado 3-5 dias/semana)
  active: 1.725,        // Muito ativo (exercício pesado 6-7 dias/semana)
  extra_active: 1.9,    // Extremamente ativo (trabalho físico pesado ou exercício 2x/dia)
} as const;
// ==================================================================
// || FIM DO BLOCO DE CÓDIGO ADICIONADO                            ||
// ==================================================================
