// Utilitário para converter propriedades de sombra para formato web-compatible
export const createShadow = (
  shadowColor: string = '#000',
  shadowOffset: { width: number; height: number } = { width: 0, height: 2 },
  shadowOpacity: number = 0.1,
  shadowRadius: number = 4,
  elevation: number = 4
) => {
  return {
    // Para iOS
    shadowColor,
    shadowOffset,
    shadowOpacity,
    shadowRadius,
    // Para Android
    elevation,
    // Para Web (usando boxShadow)
    boxShadow: `${shadowOffset.width}px ${shadowOffset.height}px ${shadowRadius}px rgba(0, 0, 0, ${shadowOpacity})`,
  };
};

// Presets comuns de sombra
export const shadowPresets = {
  small: createShadow('#000', { width: 0, height: 1 }, 0.05, 2, 2),
  medium: createShadow('#000', { width: 0, height: 2 }, 0.1, 4, 4),
  large: createShadow('#000', { width: 0, height: 4 }, 0.15, 12, 8),
  card: createShadow('#000', { width: 0, height: 2 }, 0.1, 4, 4),
  button: createShadow('#000', { width: 0, height: 2 }, 0.2, 4, 4),
  header: createShadow('#000', { width: 0, height: -2 }, 0.1, 4, 4),
};