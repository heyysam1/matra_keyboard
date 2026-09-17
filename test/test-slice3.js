// Matra Keyboard — Automated Verification Suite for Slice 3 (Modes, Layouts & Tray Integration)
import assert from 'node:assert';
import { TypingSession } from '../src/engine/TypingSession.js';
import { LayoutManager, LAYOUTS } from '../src/engine/LayoutManager.js';

async function runSlice3Tests() {
  console.log('=====================================================');
  console.log('Running Matra Keyboard Slice 3 Automated Test Suite');
  console.log('=====================================================\n');

  // Test 1: Bengali / English Mode Switching in TypingSession
  console.log('Test 1: Bengali / English Mode Switching');
  const session = new TypingSession();
  assert.strictEqual(session.mode, 'bn', 'Default mode should be Bengali (bn)');

  // Type in Bengali mode (Avro phonetic)
  for (const char of 'ami') {
    await session.handleKey({ key: char });
  }
  await session.handleKey({ key: ' ' });
  assert.strictEqual(session.committedText, 'আমি ');

  // Switch to English mode
  session.setMode('en');
  assert.strictEqual(session.mode, 'en');
  assert.strictEqual(session.activeToken, '', 'Active token must be empty in English mode');
  assert.strictEqual(session.isPopoverOpen, false, 'Popover must be closed in English mode');

  // Type in English mode: letters should pass through directly
  for (const char of 'typing English') {
    await session.handleKey({ key: char });
  }
  assert.strictEqual(session.committedText, 'আমি typing English');

  // Test Backspace in English mode
  await session.handleKey({ key: 'Backspace' });
  assert.strictEqual(session.committedText, 'আমি typing Englis');

  // Switch back to Bengali mode
  session.setMode('bn');
  assert.strictEqual(session.mode, 'bn');
  await session.handleKey({ key: ' ' });
  for (const char of 'kotha') {
    await session.handleKey({ key: char });
  }
  await session.handleKey({ key: ' ' });
  assert.strictEqual(session.committedText, 'আমি typing Englis কথা ');
  console.log('  ✓ Bengali and English mode switching verified (clean passthrough and restore)\n');

  // Test 2: LayoutManager Canonical Layout Registry
  console.log('Test 2: LayoutManager Canonical Layout Registry');
  const layoutList = LayoutManager.getLayoutList();
  assert.strictEqual(layoutList.length, 3, 'Expected 3 supported layouts');
  const ids = layoutList.map((l) => l.id);
  assert(ids.includes('avro'), 'Layout list must include avro');
  assert(ids.includes('bijoy'), 'Layout list must include bijoy');
  assert(ids.includes('probhat'), 'Layout list must include probhat');

  assert.strictEqual(LayoutManager.getLayout('avro').name, 'Avro Phonetic');
  assert.strictEqual(LayoutManager.getLayout('bijoy').name, 'Bijoy Classic');
  assert.strictEqual(LayoutManager.getLayout('probhat').name, 'Probhat');
  console.log('  ✓ LayoutManager layout registry verified (Avro, Bijoy, Probhat)\n');

  // Test 3: Visualizer Key Matrix Structure & Dual-Glyph Data
  console.log('Test 3: Visualizer Key Matrix Structure & Dual-Glyph Data');
  const avroMatrix = LayoutManager.getLayoutMatrix('avro');
  assert.strictEqual(avroMatrix.length, 5, 'Matrix should contain 5 rows');
  assert(avroMatrix[0].length > 10, 'Row 1 should contain numbers & symbols');
  
  // Verify dual glyphs on keycaps (e.g. key 'k' -> 'ক' / 'খ')
  const qKey = avroMatrix[1].find((k) => k.key === 'q');
  assert(qKey, 'Key Q should exist in row 2');
  assert(qKey.bnNormal, 'Key Q should have bnNormal glyph');

  const bijoyMatrix = LayoutManager.getLayoutMatrix('bijoy');
  const jKeyBijoy = bijoyMatrix[2].find((k) => k.key === 'j');
  assert.strictEqual(jKeyBijoy.bnNormal, 'ক', 'Bijoy key "j" normal glyph should be "ক"');
  assert.strictEqual(jKeyBijoy.bnShift, 'খ', 'Bijoy key "J" shifted glyph should be "খ"');

  const probhatMatrix = LayoutManager.getLayoutMatrix('probhat');
  const kKeyProbhat = probhatMatrix[2].find((k) => k.key === 'k');
  assert.strictEqual(kKeyProbhat.bnNormal, 'ক', 'Probhat key "k" normal glyph should be "ক"');
  assert.strictEqual(kKeyProbhat.bnShift, 'খ', 'Probhat key "K" shifted glyph should be "খ"');
  console.log('  ✓ Visualizer key matrix and dual-glyph data generated correctly\n');

  // Test 4: Bijoy Classic Fixed Layout Mapping in TypingSession
  console.log('Test 4: Bijoy Classic Fixed Layout Mapping in TypingSession');
  const bijoySession = new TypingSession();
  bijoySession.setLayout('bijoy');
  assert.strictEqual(bijoySession.layout, 'bijoy');

  // 'j' -> ক
  await bijoySession.handleKey({ key: 'j' });
  assert.strictEqual(bijoySession.committedText, 'ক');

  // 'g' -> ্ (hasanta)
  await bijoySession.handleKey({ key: 'g' });
  assert.strictEqual(bijoySession.committedText, 'ক্');

  // 'j' -> ক (forms ক্ক)
  await bijoySession.handleKey({ key: 'j' });
  assert.strictEqual(bijoySession.committedText, 'ক্ক');

  // 'f' -> া (forms ক্কা)
  await bijoySession.handleKey({ key: 'f' });
  assert.strictEqual(bijoySession.committedText, 'ক্কা');

  // Shifted key 'J' -> খ
  await bijoySession.handleKey({ key: 'J', shiftKey: true });
  assert.strictEqual(bijoySession.committedText, 'ক্কাখ');
  console.log('  ✓ Bijoy fixed layout keymapping and shift state verified\n');

  // Test 5: Probhat Fixed Layout Mapping in TypingSession
  console.log('Test 5: Probhat Fixed Layout Mapping in TypingSession');
  const probhatSession = new TypingSession();
  probhatSession.setLayout('probhat');
  assert.strictEqual(probhatSession.layout, 'probhat');

  // In Probhat: 'k' -> ক
  await probhatSession.handleKey({ key: 'k' });
  assert.strictEqual(probhatSession.committedText, 'ক');

  // 'a' -> া
  await probhatSession.handleKey({ key: 'a' });
  assert.strictEqual(probhatSession.committedText, 'কা');

  // Shifted 'K' -> খ
  await probhatSession.handleKey({ key: 'K', shiftKey: true });
  assert.strictEqual(probhatSession.committedText, 'কাখ');
  console.log('  ✓ Probhat fixed layout keymapping verified\n');

  // Test 6: Single Engine Standard (Seamless Layout Switching)
  console.log('Test 6: Single Engine Standard (Reusing the Same Engine Across Modes)');
  const unifiedSession = new TypingSession();
  
  // 1. Avro Phonetic
  for (const char of 'bangla') {
    await unifiedSession.handleKey({ key: char });
  }
  await unifiedSession.handleKey({ key: ' ' });
  assert(unifiedSession.committedText.includes('বাংলা'), 'Avro phonetic should produce বাংলা');

  // 2. Switch to English
  unifiedSession.setMode('en');
  for (const char of ' rocks ') {
    await unifiedSession.handleKey({ key: char });
  }
  assert(unifiedSession.committedText.includes(' rocks '), 'English mode should insert English');

  // 3. Switch back to Bengali Bijoy
  unifiedSession.setMode('bn');
  unifiedSession.setLayout('bijoy');
  await unifiedSession.handleKey({ key: 'j' }); // ক
  await unifiedSession.handleKey({ key: 'f' }); // া
  assert(unifiedSession.committedText.endsWith('কা'), 'Bijoy mode should insert কা');

  console.log(`  ✓ Unified session completed multi-layout sequence: "${unifiedSession.committedText}"\n`);

  console.log('=====================================================');
  console.log('ALL SLICE 3 AUTOMATED TESTS PASSED SUCCESSFULLY! (6/6)');
  console.log('=====================================================\n');
}

runSlice3Tests().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
