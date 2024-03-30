'use client';
import "./globals.css";

import { Button } from "@tremor/react";
import Image from "next/image";


// Render the default Next.js 404 page when a route
// is requested that doesn't match the middleware and
// therefore doesn't have a locale associated with it.

export default function NotFound() {
  return (
    <html>
      <body
        className={`font-sans text-default bg-[url('/bg.svg')]`}
      >
      
        <div className="h-full overflow-y-auto w-full px-4">
          <div className="lg:px-24 lg:py-24 md:py-20 md:px-44 px-4 py-24 items-center flex justify-center flex-col-reverse lg:flex-row md:gap-28 gap-16">
            <div className="xl:pt-24 w-full xl:w-1/2 relative pb-12 lg:pb-0">
                <div className="relative">
                    <div className="absolute">
                        <div className="">
                            <h1 className="my-2 text-gray-800 font-bold text-2xl">
                                Page Not Found
                            </h1>
                            <p className="my-2 text-gray-800">We may see the page beeing implemented soon...</p>
                            <div onClick={() =>
                                window.history.back()
                              }>
                              <Button color="green" size="xs">
                                  Go Back Now
                              </Button>
                            </div>
                        </div>
                    </div>
                    <div>
                        <Image src="/404-2.png" alt="404" width={500} height={500} />

                    </div>
                </div>
            </div>
            <div>
                <Image src="/Group.png" alt="404-img" width={500} height={500} />
            </div>
        </div>

        </div>
      </body>
    </html>
  );
}