import clsx from 'clsx';
import '../../globals.css';
import './layout.css';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <div className="relative flex min-h-screen">
          <div className={clsx(
            "absolute top-2 left-2 rounded-full border-white",
            "size-6 border flex justify-center items-center bg-phtalo-dark",
            "hover:scale-200 transition-transform duration-1000 ease-out animate-[pulse_10s_cubic-bezier(0.4,0,0.6,1)_3s_infinite] group",
            "z-100"
          )}>
            <div className="bg-white size-1 rounded-full animate-pulse shadow-[0_0_5px_5px_rgba(255,255,255,0.5)]"></div>
          </div>
          <div className="grow">{children}</div>
        </div>
      </body>
    </html>
  );
}
