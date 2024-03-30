'use client';

import React from "react";
import Link from "next/link";
import { Disclosure } from '@headlessui/react'
import { FiChevronUp } from "react-icons/fi";

interface Item {
  name: string | JSX.Element;
  link: string;
}

interface Collection {
  name: string | JSX.Element;
  items: Item[];
}

export function AdminSidebar({ collections }: { collections: Collection[] }) {
  return (
    <aside className="pl-4">
      <nav className="space-y-2 pl-4">
        {collections.map((collection, collectionInd) => (
          <Disclosure key={collectionInd} as="div" className="mt-2" defaultOpen={collectionInd < 2}>
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between px-4 py-2 text-left text-sm font-medium text-gray-500">
                <span>{collection.name}</span>
                <FiChevronUp className="ui-open:rotate-180 ui-open:transform  h-5 w-5 text-black-500" />
              </Disclosure.Button>
              <Disclosure.Panel className="px-4 pb-2 pt-2 text-sm text-gray-700">
                {collection.items.map((item) => (
                  <Link key={item.link} href={item.link}>
                    <button className="text-sm block w-48 py-2 px-2 text-left hover:bg-hover-light rounded">
                      <div>{item.name}</div>
                    </button>
                  </Link>
                ))}
              </Disclosure.Panel>
            </>
          )}
          </Disclosure>
        ))}
      </nav>
    </aside>
  );
}
