'use client';

import Link from 'next/link';

export default function Dashboard() {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col justify-between group/design-root overflow-x-hidden bg-white" style={{fontFamily: 'Manrope, "Noto Sans", sans-serif'}}>
      <div>
        <header className="bg-transparent px-6 pt-8 pb-6 text-black">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-4">
              <h1 className="text-3xl font-bold text-gray-800">TheraFlow</h1>
              <img 
                alt="Profile Picture" 
                className="w-16 h-16 rounded-full border-2 border-gray-200" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBUiJu29SWXlc5Hnyj7K2-hNDmcpTtVXfHHr0L6AEHb1wJhFbqkbbvqHXecessK0tpY01RZOHJ3mMNC-Q28D--hJBSrEChRdXlVF9rd57pX7MUSmuoITA2t-p93R8zxaQ96_Zdq6JjjwEcOcvMfWWfjsBJVm2YXlkvQUYixqAfpv_tw7BdAE7JXENDhyRzTOOItJSb9S6f0mmQRy0aOhsjLsi_uFNXYU6wI3hglWLeP3hlBABZ9xU9AMjKOoUFDnG_fD19T5unt7QS9"
              />
            </div>
            <button className="text-gray-600">
              <span className="material-symbols-outlined text-3xl">
                notifications
              </span>
            </button>
          </div>
          <p className="text-gray-600 mt-4 text-xl">Welcome, Alex!</p>
        </header>
        
        <main className="p-6 grid grid-cols-2 gap-6">
          <Link href="/chat" className="col-span-2 flex flex-col items-center justify-center p-6 rounded-2xl shadow-lg transition-transform transform hover:scale-105 bg-white border border-gray-200">
            <div className="w-20 h-20 mb-4 flex items-center justify-center rounded-full bg-gray-100 shadow-[0_0_15px_rgba(0,0,0,0.05)]">
              <span className="material-symbols-outlined text-5xl text-gray-700">forum</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Chat with TheraFlow</h3>
            <p className="text-sm text-gray-500 text-center mt-1">Talk to our AI assistant</p>
          </Link>
          
           <Link href="/" className="flex flex-col items-center justify-center p-6 rounded-2xl shadow-lg transition-transform transform hover:scale-105 bg-white border border-gray-200">
             <div className="w-20 h-20 mb-4 flex items-center justify-center rounded-full bg-gray-100 shadow-[0_0_15px_rgba(0,0,0,0.05)]">
               <span className="material-symbols-outlined text-5xl text-gray-700">graphic_eq</span>
             </div>
             <h3 className="text-lg font-semibold text-gray-800">Talk with TheraFlow</h3>
             <p className="text-sm text-gray-500 text-center mt-1">Voice conversation with AI</p>
           </Link>
          
          <Link href="#" className="flex flex-col items-center justify-center p-6 rounded-2xl shadow-lg transition-transform transform hover:scale-105 bg-white border border-gray-200">
            <div className="w-20 h-20 mb-4 flex items-center justify-center rounded-full bg-gray-100 shadow-[0_0_15px_rgba(0,0,0,0.05)]">
              <span className="material-symbols-outlined text-5xl text-gray-700">air</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Breathing Exercises</h3>
            <p className="text-sm text-gray-500 text-center mt-1">Calm exercises</p>
          </Link>
          
          <Link href="#" className="col-span-2 flex flex-col items-center justify-center p-6 rounded-2xl shadow-lg transition-transform transform hover:scale-105 bg-white border border-gray-200">
            <div className="w-20 h-20 mb-4 flex items-center justify-center rounded-full bg-gray-100 shadow-[0_0_15px_rgba(0,0,0,0.05)]">
              <span className="material-symbols-outlined text-5xl text-gray-700">self_improvement</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Guided Meditations</h3>
            <p className="text-sm text-gray-500 text-center mt-1">Find your inner peace</p>
          </Link>
          
          <div className="col-span-2">
            <Link href="#" className="flex items-center p-6 rounded-2xl shadow-lg transition-transform transform hover:scale-105 bg-white border border-gray-200">
              <div className="w-20 h-20 mr-6 flex items-center justify-center rounded-full bg-gray-100 shadow-[0_0_15px_rgba(0,0,0,0.05)]">
                <span className="material-symbols-outlined text-5xl text-gray-700">edit_note</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Daily Journal</h3>
                <p className="text-base text-gray-500 mt-1">Reflect on your day</p>
              </div>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
