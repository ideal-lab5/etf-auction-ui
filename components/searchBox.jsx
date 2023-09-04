import { BookOpenIcon } from '@heroicons/react/20/solid'

export default function SearchBox() {
  return (
    <div>

      <div className="mt-1 flex rounded-md shadow-sm">
        <div className="relative flex flex-grow items-stretch focus-within:z-10">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <BookOpenIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            name="searchText"
            id="searchText"
            className="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Ex. nft satoshi..."
          />
        </div>
      </div>
    </div>
  )
}