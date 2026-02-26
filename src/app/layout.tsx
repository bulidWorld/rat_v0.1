import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "需求管理系统",
  description: "需求管理系统 - 高效管理和跟踪需求",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen">
        <Providers>
          {/* 导航栏 */}
          <nav className="bg-[#1E293B] shadow-lg fixed top-0 left-0 right-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <h1 className="text-2xl font-bold text-white">需求管理系统</h1>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="ml-4 flex items-center md:ml-6">
                    <div className="flex items-center">
                      <span className="text-gray-300 mr-3">张明</span>
                      <Image 
                        className="h-8 w-8 rounded-full" 
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" 
                        alt="用户头像"
                        width={32}
                        height={32}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {/* 主布局 */}
          <div className="flex pt-16">
            {/* 侧边栏 */}
            <aside className="w-64 bg-[#1E293B] shadow-lg fixed left-0 bottom-0 top-16 overflow-y-auto">
              <nav className="p-4">
                <Link 
                  href="/" 
                  className="sidebar-item active block px-4 py-3 rounded-md text-white font-medium mb-2 flex items-center"
                >
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path>
                  </svg>
                  需求列表
                </Link>
                <Link 
                  href="/create" 
                  className="sidebar-item block px-4 py-3 rounded-md text-gray-300 hover:text-white font-medium mb-2 flex items-center"
                >
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"></path>
                  </svg>
                  新建需求
                </Link>
              </nav>
            </aside>

            {/* 主内容区 */}
            <main className="flex-1 ml-64 p-6">
              <Suspense fallback={<div className="text-white">加载中...</div>}>
                {children}
              </Suspense>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
