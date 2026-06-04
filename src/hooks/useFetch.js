import { useCallback, useEffect, useRef, useState } from 'react'

export function useFetch(fetcher, options = {}) {
  const { immediate = false, initialData = null } = options
  const fetcherRef = useRef(fetcher)
  const [data, setData] = useState(initialData)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(Boolean(immediate))

  useEffect(() => {
    fetcherRef.current = fetcher
  }, [fetcher])

  const execute = useCallback(async (...args) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetcherRef.current(...args)
      const payload = response?.data ?? response

      setData(payload)

      return payload
    } catch (fetchError) {
      setError(fetchError)
      throw fetchError
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [execute, immediate])

  const reset = useCallback(() => {
    setData(initialData)
    setError(null)
    setLoading(false)
  }, [initialData])

  return {
    data,
    error,
    loading,
    execute,
    refetch: execute,
    setData,
    setError,
    reset,
  }
}