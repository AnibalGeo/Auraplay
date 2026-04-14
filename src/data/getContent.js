import N1 from './content/N1.json'
import N2 from './content/N2.json'
import N3 from './content/N3.json'
import N4 from './content/N4.json'
import N5 from './content/N5.json'
import N6 from './content/N6.json'
import N7 from './content/N7.json'

const CONTENT = { N1, N2, N3, N4, N5, N6, N7 }

export function getContent(levelId) {
  return CONTENT[levelId] ?? {}
}
