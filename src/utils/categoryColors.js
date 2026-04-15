export const CATEGORY_COLOR_OPTIONS = [
  { enumValue: 'COLOR_1', hex: '#90caf9' },
  { enumValue: 'COLOR_2', hex: '#ce93d8' },
  { enumValue: 'COLOR_3', hex: '#a5d6a7' },
  { enumValue: 'COLOR_4', hex: '#fff59d' },
  { enumValue: 'COLOR_5', hex: '#ffab91' },
  { enumValue: 'COLOR_6', hex: '#b0bec5' },
  { enumValue: 'COLOR_7', hex: '#80cbc4' },
  { enumValue: 'COLOR_8', hex: '#f48fb1' },
  { enumValue: 'COLOR_9', hex: '#e1bee7' },
  { enumValue: 'COLOR_10', hex: '#c5e1a5' },
  { enumValue: 'COLOR_11', hex: '#ffe082' },
  { enumValue: 'COLOR_12', hex: '#ffcc80' },
  { enumValue: 'COLOR_13', hex: '#b39ddb' },
  { enumValue: 'COLOR_14', hex: '#81d4fa' },
  { enumValue: 'COLOR_15', hex: '#f8bbd0' },
  { enumValue: 'COLOR_16', hex: '#d7ccc8' },
  { enumValue: 'COLOR_17', hex: '#cfd8dc' },
  { enumValue: 'COLOR_18', hex: '#ffcdd2' },
  { enumValue: 'COLOR_19', hex: '#c8e6c9' },
  { enumValue: 'COLOR_20', hex: '#bbdefb' },
];

export const DEFAULT_CATEGORY_COLOR_HEX = CATEGORY_COLOR_OPTIONS[0].hex.toUpperCase();
export const DEFAULT_CATEGORY_COLOR_ENUM = CATEGORY_COLOR_OPTIONS[0].enumValue;

const COLOR_ENUM_TO_HEX = Object.fromEntries(
  CATEGORY_COLOR_OPTIONS.map((option) => [option.enumValue, option.hex.toUpperCase()])
);

const COLOR_HEX_TO_ENUM = Object.fromEntries(
  CATEGORY_COLOR_OPTIONS.map((option) => [option.hex.toUpperCase(), option.enumValue])
);

const isHexColor = (value) =>
  typeof value === 'string' &&
  /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value.trim());

export const toCategoryColorHex = (value) => {
  if (!value) return DEFAULT_CATEGORY_COLOR_HEX;

  const trimmed = String(value).trim();
  const normalized = trimmed.toUpperCase();

  if (COLOR_ENUM_TO_HEX[normalized]) {
    return COLOR_ENUM_TO_HEX[normalized];
  }

  if (isHexColor(trimmed)) {
    return trimmed.toUpperCase();
  }

  return DEFAULT_CATEGORY_COLOR_HEX;
};

export const toCategoryColorEnum = (value) => {
  if (!value) return DEFAULT_CATEGORY_COLOR_ENUM;

  const normalizedHex = toCategoryColorHex(value);
  return COLOR_HEX_TO_ENUM[normalizedHex] ?? DEFAULT_CATEGORY_COLOR_ENUM;
};
