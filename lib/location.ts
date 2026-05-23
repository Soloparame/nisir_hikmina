import { City, Country, State } from "country-state-city";

export type CountryOption = { isoCode: string; name: string; flag: string };
export type StateOption = { isoCode: string; name: string };
export type CityOption = { name: string };

const CITY_DROPDOWN_LIMIT = 400;

export function getCountries(): CountryOption[] {
  return Country.getAllCountries()
    .map((c) => ({
      isoCode: c.isoCode,
      name: c.name,
      flag: c.flag,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getStates(countryCode: string): StateOption[] {
  return State.getStatesOfCountry(countryCode)
    .map((s) => ({ isoCode: s.isoCode, name: s.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getCities(
  countryCode: string,
  stateCode?: string
): { cities: CityOption[]; useTextInput: boolean } {
  const raw =
    (stateCode
      ? City.getCitiesOfState(countryCode, stateCode)
      : City.getCitiesOfCountry(countryCode)) ?? [];

  const cities = raw
    .map((c) => ({ name: c.name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  if (cities.length > CITY_DROPDOWN_LIMIT) {
    return { cities: [], useTextInput: true };
  }

  return { cities, useTextInput: cities.length === 0 };
}
