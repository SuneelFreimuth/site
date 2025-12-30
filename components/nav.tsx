import { ReactNode } from 'react';

import Link from 'next/link';

export interface ILink {
  href: string;
  content: ReactNode;
}

export function Nav({ links }: { links: ILink[] }) {
  return <DesktopNav links={links}/>
}

function DesktopNav({ links }: {
  links: ILink[];
}) {
  return (
    <div className='flex justify-between items-center'>
      <div className='flex-1'>
        <h1 className="text-lg"><Link href="/">Suneel Freimuth</Link></h1>
      </div>
      <nav className='flex justify-end gap-2'>
        {links?.map(link => (
          <Link key={link.href} href={link.href} className='p-2 rounded-md hover:bg-white/10 transition'>
            <span>{link.content}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}

// function MobileNav() {
//   const [menuOpen, setMenuOpen] = useState(false)

//   return (
//     <div>
//       <h1><Link href="/">Suneel Freimuth</Link></h1>
//       <img
//         src={icons.hamburgerMenu.href}
//         onClick={() => {
//           setMenuOpen(true)
//         }}
//       />
//       {when(
//         menuOpen,
//         <div
//           onClick={e => {
//             if (e.target !== e.currentTarget)
//               return;
//             setMenuOpen(false)
//           }}
//         >
//           <div>
//             <Link href="/">
//               <span>Home</span>
//             </Link>
//             <Link href="/reading">
//               <span>Reading</span>
//             </Link>
//             <a href="https://github.com/SuneelFreimuth">
//               <span>Github</span>
//             </a>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }
