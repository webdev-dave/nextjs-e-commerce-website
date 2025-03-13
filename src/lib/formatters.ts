const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
    minimumFractionDigits: 0,
  })
  
  export function formatCurrency(amount: number): string {
    return CURRENCY_FORMATTER.format(amount)
  }
  
  const NUMBER_FORMATTER = new Intl.NumberFormat("en-US")
  
  export function formatNumber(number: number): string {
    return NUMBER_FORMATTER.format(number)
  }

  export const dateFormatter = new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  })
  