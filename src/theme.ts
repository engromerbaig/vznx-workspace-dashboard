interface SharedColors {
  bgColor: string;
  textColor: string;
}

interface SectionBg {
  bgColor: string;
  textColor: string;
  borderColor: string;
  cardBgColor: string;
}

interface Colors {
  accentFooter: string;
}

interface SectionPaddings {
  horizontalPx: string;
  horizontalMx: string;
  verticalPy: string;
  verticalPyHero: string;
  verticalPyHeavy: string;
  verticalMy: string;
}

interface Gradients {
  footer: string;
  hero: string;
}

interface Navbar {
  bgColor: string;
  textColor: string;
}

interface LayoutPages {
  paddingHorizontal: string;
  paddingMenu: string;
  paddingVertical: string;
  paddingBottom: string;
  conatinerVerticalGap: string;
  paddingVerticalTop: string;
}

interface Hero {
  titleColor: string;
  textColor: string;
}

interface Content {
  bgColor: string;
}

interface Theme {
  sectionBg: SectionBg;
  colors: Colors;
  sectionPaddings: SectionPaddings;
  gradients: Gradients;
  layoutPages: LayoutPages;
  hero: Hero;
  content: Content;
}

const sharedColors: SharedColors = {
  bgColor: 'bg-white-800',
  textColor: 'text-black',
};

export const theme: Theme = {
  sectionBg: {
    bgColor: 'bg-theme-light dark:bg-theme-dark',
    textColor: 'text-body-text-light dark:text-body-text-dark',
    borderColor: 'border-light-hover dark:border-dark-hover',
    cardBgColor: 'bg-white dark:bg-dark-hover',
  },

  colors: {
    accentFooter: "text-black", // use your global blue accent
  },

  sectionPaddings: {
    horizontalPx: "px-2 lg:px-10 ",
    horizontalMx: "mx-4 lg:mx-20 ",
    verticalPy: "py-8 lg:py-10",  
    verticalPyHero: "py-12 lg:py-16",
    verticalPyHeavy: "pt-12 lg:pt-40",  
    verticalMy: "my-6 lg:my-8",
  },

  gradients: {
    footer: 'bg-gradient-to-br from-primary via-primary to-visa-green',
    hero: 'bg-gradient-to-r from-primary to-visa-green',
  },



  layoutPages: {
    paddingHorizontal: 'px-4 md:px-10 lg:px-20',
    paddingMenu: 'pl-6 md:pl-10 lg:pl-20',
    paddingVertical: 'py-16 md:py-20 lg:py-24',
    paddingBottom: 'pb-12 md:pb-20 lg:pb-24',
    conatinerVerticalGap: 'space-y-6 lg:space-y-12',
    paddingVerticalTop: 'pt-16 md:pt-20 lg:pt-24',
  },

  hero: {
    titleColor: 'text-black dark:text-white',
    textColor: 'text-body-text-light dark:text-body-text-dark',
  },

  content: {
    bgColor: sharedColors.bgColor,
  },
};