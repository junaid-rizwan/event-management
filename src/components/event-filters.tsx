"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, X } from "lucide-react"
import { useAppSelector, useAppDispatch } from "@/lib/hooks"
import { setFilters } from "@/lib/slices/eventsSlice"

const categories = ["Technology", "Music", "Food", "Sports", "Art", "Business", "Health"]
const locations = ["San Francisco, CA", "Los Angeles, CA", "New York, NY", "Chicago, IL", "Austin, TX"]

export function EventFilters() {
  const { filters } = useAppSelector((state) => state.events)
  const dispatch = useAppDispatch()

  const handleSearchChange = (value: string) => {
    dispatch(setFilters({ search: value }))
  }

  const handleCategoryChange = (value: string) => {
    dispatch(setFilters({ category: value === "all" ? "" : value }))
  }

  const handleLocationChange = (value: string) => {
    dispatch(setFilters({ location: value === "all" ? "" : value }))
  }

  const handleDateChange = (value: string) => {
    dispatch(setFilters({ date: value }))
  }

  const clearFilters = () => {
    dispatch(setFilters({ search: "", category: "", location: "", date: "" }))
  }

  const hasActiveFilters = filters.search || filters.category || filters.location || filters.date

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search events..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filters.category || "all"} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.location || "all"} onValueChange={handleLocationChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={filters.date}
            onChange={(e) => handleDateChange(e.target.value)}
            className="w-[140px]"
          />
        </div>
      </div>
      {hasActiveFilters && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Filters applied</p>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-2" />
            Clear filters
          </Button>
        </div>
      )}
    </div>
  )
}
