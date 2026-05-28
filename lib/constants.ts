// FUNDEB financial constants for integral education planning
// Reference: VAAF 2026 + PETI supplement

export const VAAF_BASE = 5962.79;
export const FATOR_INTEGRAL = 1.50;
export const FATOR_AI_PARCIAL = 1.00;
export const FATOR_AF_PARCIAL = 1.10;
export const PETI_POR_ALUNO = 1693.22;

export const VALOR_INTEGRAL = VAAF_BASE * FATOR_INTEGRAL; // 8944.185
export const GANHO_AI =
  VAAF_BASE * (FATOR_INTEGRAL - FATOR_AI_PARCIAL) + PETI_POR_ALUNO; // 4674.615
export const GANHO_AF =
  VAAF_BASE * (FATOR_INTEGRAL - FATOR_AF_PARCIAL) + PETI_POR_ALUNO; // 4078.338

export const ANO_REFERENCIA = 2026;
export const ANO_INICIO_OPS = 2027;
export const MES_INICIO_OPS = 2; // February
export const MESES_GAP = 11; // Feb-Dec before FUNDEB kicks in Jan next year
export const MESES_OPERACIONAIS_ANO = 10; // Feb-Nov

export const FUNDEB_PARAMS = {
  VAAF_BASE,
  FATOR_INTEGRAL,
  FATOR_AI_PARCIAL,
  FATOR_AF_PARCIAL,
  PETI_POR_ALUNO,
  VALOR_INTEGRAL,
  GANHO_AI,
  GANHO_AF,
  ANO_REFERENCIA,
  ANO_INICIO_OPS,
  MES_INICIO_OPS,
  MESES_GAP,
  MESES_OPERACIONAIS_ANO,
} as const;
