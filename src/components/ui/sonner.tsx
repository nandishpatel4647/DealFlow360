import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-white dark:group-[.toaster]:bg-slate-900 group-[.toaster]:text-slate-900 dark:group-[.toaster]:text-slate-100 group-[.toaster]:border-slate-200 dark:group-[.toaster]:border-slate-800 group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-slate-500 dark:group-[.toast]:text-slate-400',
          actionButton:
            'group-[.toast]:bg-indigo-600 group-[.toast]:text-white',
          cancelButton:
            'group-[.toast]:bg-slate-100 dark:group-[.toast]:bg-slate-800 group-[.toast]:text-slate-500',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
