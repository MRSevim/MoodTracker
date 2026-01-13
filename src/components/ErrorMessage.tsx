const ErrorMessage = ({ error, id }: { error: string; id?: string }) => {
  return (
    <div
      id={id}
      className="bg-red-50 border border-red-200 rounded-md p-3"
      role="alert"
    >
      <p className="text-red-500 text-sm font-medium">{error}</p>
    </div>
  );
};

export default ErrorMessage;
