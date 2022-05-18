import { useState, useRef, useEffect } from 'react'

const useSearchBar = (initialState: string[]) => {
  const searchRef = useRef<HTMLInputElement>(null)
  const [search, setSearch] = useState('')

  const [searchResults, setSearchResults] = useState<string[]>(initialState)

  useEffect(() => {
    if (searchRef.current) {
      const results = initialState.filter((account) => {
        return account.toLowerCase().includes(search.toLowerCase())
      })
      setSearchResults(results)
    }
  }, [search, initialState])

  return {
    searchResults,
    searchRef,
    setSearch,
  }
}

export default useSearchBar
