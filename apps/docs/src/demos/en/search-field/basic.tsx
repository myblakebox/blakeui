import {Label, SearchField} from "@blakeui/react";

export function Basic() {
  return (
    <SearchField name="search">
      <Label>Search</Label>
      <SearchField.Group>
        <SearchField.SearchIcon />
        <SearchField.Input className="w-[280px]" placeholder="Search..." />
        <SearchField.ClearButton />
      </SearchField.Group>
    </SearchField>
  );
}
