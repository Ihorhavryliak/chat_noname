type ClassNamesType = (
  ...classes: (string | undefined | null | false)[]
) => string;

const classNames: ClassNamesType = (...classes) => {
  return classes.filter(Boolean).join(" ");
};

export default classNames;
