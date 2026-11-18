const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const source = fs.readFileSync(path.join(__dirname, '../src/components/map/observationAreas.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const exported = {};
new Function('exports', 'require', compiled)(exported, require);
const { observationAreas } = exported;
const now = Date.parse('2026-11-18T12:00:00Z');
const event = (id, x, level = 'informativa', age = 1, y = -54.8) => ({
  id, kind: 'observation', coordinate: [x, y], level, date: new Date(now - age * 3600000).toISOString(),
});
assert.equal(observationAreas([event('a', -68.3)], now).length, 0);
assert.equal(observationAreas([event('a', -68.3), event('b', -68.3, 'peligrosa', 120)]).length, 1);
assert.equal(observationAreas([event('a', -68.3), { ...event('b', -68.3), kind: 'report' }], now).length, 0);
const tied = observationAreas([event('a', -68.3), event('b', -68.31, 'peligrosa')], now)[0];
assert.equal(tied.level, 'peligrosa');
assert.equal(tied.feature.geometry.type, 'Polygon');
const majority = observationAreas([event('a', -68.3), event('b', -68.31), event('c', -68.305, 'peligrosa', 1, -54.805)], now)[0];
assert.equal(majority.level, 'informativa');
assert.equal(majority.counts.peligrosa, 1);
assert.equal(observationAreas([event('a', -68.3, null), event('b', -68.3, null)], now)[0].level, 'desconocida');
const chain = [event('a', -68.3), event('b', -68.32), event('c', -68.34)];
assert.equal(observationAreas(chain, now)[0].members.length, 2);
assert.deepEqual(observationAreas(chain, now), observationAreas([...chain].reverse(), now));
assert.equal(observationAreas([event('a', -68.3), event('b', -68.3)], now)[0].feature.geometry.type, 'Polygon');
assert.equal(observationAreas([event('a', -68.3), event('b', -68.31), event('c', -68.32)], now)[0].feature.geometry.type, 'Polygon');
const actualGroup = observationAreas([
  { ...event('1', -68.40228151293836, 'informativa', 120), coordinate: [-68.40228151293836, -54.79553916639436] },
  { ...event('2', -68.41194208897649), coordinate: [-68.41194208897649, -54.78841326823672] },
  { ...event('5', -68.41152191162111, 'precaucion'), coordinate: [-68.41152191162111, -54.805038410317124] },
]);
assert.equal(actualGroup.length, 1);
assert.equal(actualGroup[0].members.length, 3);
assert.equal(actualGroup[0].level, 'informativa');
assert.equal(actualGroup[0].feature.geometry.type, 'Polygon');
console.log('PASS: grouping across dates/relevances, reported three-point regression, majority, ties and geometry');
