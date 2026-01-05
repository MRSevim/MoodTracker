const Container = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={"mx-auto px-4 max-w-7xl flex-1 flex flex-col " + className}>
      {children}
    </div>
  );
};

export default Container;
