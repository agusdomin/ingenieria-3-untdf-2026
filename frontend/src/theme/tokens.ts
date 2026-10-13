export const tokens = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },

  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    pill: 999,
  },

  typography: {
    title: {
      fontSize: 28,
      fontWeight: '700' as const,
    },

    heading: {
      fontSize: 20,
      fontWeight: '600' as const,
    },

    subheading: {
      fontSize: 17,
      fontWeight: '600' as const,
    },

    body: {
      fontSize: 16,
      fontWeight: '400' as const,
    },

    bodySmall: {
      fontSize: 14,
      fontWeight: '400' as const,
    },

    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
    },

    button: {
      fontSize: 15,
      fontWeight: '600' as const,
    },
  },

  icons: {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
  },

  button: {
    sm: {
      height: 36,
      borderRadius: 10,
    },

    md: {
      height: 48,
      borderRadius: 14,
    },

    lg: {
      height: 52,
      borderRadius: 16,
    },
  },

  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
  },

  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },

  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  navbar: {
    height: 68,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    borderTopWidth: 1,

    iconSize: 22,
    labelSize: 12,

    item: {
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
  },

  bottomSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },

  elevation: {
    card: 2,
    modal: 6,
    floating: 8,
  },
};