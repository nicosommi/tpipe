export default function match (source = [], stringValue, fallBack = null) {
  const sourceKey = source.find(
    (value) => {
      if (value.key instanceof RegExp) {
        const test = stringValue.search(value.key) >= 0
        return test
      } else {
        return (new RegExp(value, 'g')).test(stringValue)
      }
    }
  )

  if (sourceKey) {
    return sourceKey.value
  } else {
    return fallBack
  }
}
