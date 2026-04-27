const imageInput  = document.getElementById('imageInput');
const uploadBox   = document.getElementById('uploadBox');
const uzContent   = document.getElementById('uzContent');
const uzFileInfo  = document.getElementById('uzFileInfo');
const fname       = document.getElementById('fname');
const previewImg  = document.getElementById('previewImg');
const prevPH      = document.getElementById('prevPH');
const previewOverlay = document.getElementById('previewOverlay');
const predictBtn  = document.getElementById('predictBtn');
const btnTxt      = document.getElementById('btnTxt');
const resultWrap  = document.getElementById('resultWrap');
const errBar      = document.getElementById('errBar');
const errMsg      = document.getElementById('errMsg');
const resBadge    = document.getElementById('resBadge');
const resVerdict  = document.getElementById('resVerdict');
const resInterp   = document.getElementById('resInterp');
const verdictIcon = document.getElementById('verdictIcon');
const probNum     = document.getElementById('probNum');
const probFill    = document.getElementById('probFill');
const riskChip    = document.getElementById('riskChip');
const actList     = document.getElementById('actList');
const resultHeaderIcon = document.getElementById('resultHeaderIcon');

// Drag & drop
uploadBox.addEventListener('dragover', e => { e.preventDefault(); uploadBox.classList.add('drag'); });
uploadBox.addEventListener('dragleave', () => uploadBox.classList.remove('drag'));
uploadBox.addEventListener('drop', e => {
  e.preventDefault(); uploadBox.classList.remove('drag');
  const f = e.dataTransfer.files[0];
  if (f) loadFile(f);
});
imageInput.addEventListener('change', e => {
  const f = e.target.files?.[0];
  if (f) loadFile(f);
});

function loadFile(file) {
  fname.textContent = file.name;
  uzContent.style.display = 'none';
  uzFileInfo.style.display = 'block';
  const r = new FileReader();
  r.onload = ev => {
    previewImg.src = ev.target.result;
    previewImg.style.display = 'block';
    prevPH.style.display = 'none';
    previewOverlay.style.display = 'block';
  };
  r.readAsDataURL(file);
}

predictBtn.addEventListener('click', async () => {
  const file = imageInput.files?.[0];
  if (!file) { showErr('Please select an image first.'); return; }
  if (file.size > 5 * 1024 * 1024) { showErr('File too large — use a focused lesion image under 5 MB.'); return; }

  reset();
  predictBtn.disabled = true;
  predictBtn.classList.add('loading');
  btnTxt.textContent = 'Analyzing…';

  const fd = new FormData();
  fd.append('file', file);

  try {
    const res = await fetch('/predict', { method: 'POST', body: fd });
    const data = await res.json();
    if (!res.ok || data.status !== 'success') throw new Error(data.message || 'Prediction failed.');
    showResult(data);
  } catch (err) {
    showErr(err.message || 'Unexpected error.');
  } finally {
    predictBtn.disabled = false;
    predictBtn.classList.remove('loading');
    btnTxt.textContent = 'Analyze Lesion';
  }
});

function showResult(data) {
  const p = data.melanoma_probability;
  const pct = (p * 100).toFixed(1);
  const mel = data.predicted_label === 'Melanoma';

  // Badge
  resBadge.textContent = mel ? 'Screening Alert' : 'Lower Risk';
  resBadge.className = 'result-badge ' + (mel ? 'alert' : 'safe');

  // Verdict icon
  verdictIcon.textContent = mel ? '⚠️' : '✅';
  verdictIcon.className = 'verdict-icon ' + (mel ? 'mel' : 'ok');

  // Verdict text
  resVerdict.textContent = mel ? 'Possible Melanoma Pattern Detected' : 'Likely Non-Melanoma';
  resVerdict.className = 'verdict-label ' + (mel ? 'mel' : 'ok');
  resInterp.textContent = mel
    ? 'This model is tuned for high sensitivity, reducing missed cases. Some benign lesions may also be flagged. Clinical confirmation is required.'
    : 'Screening suggests a lower-risk pattern. Continue monitoring and consult a dermatologist if any changes are observed.';

  // Probability
  probNum.textContent = pct + '%';
  setTimeout(() => {
    probFill.style.width = Math.min(100, Number(pct)) + '%';
    if (p >= 0.66) {
      probFill.style.background = '#ef4444';
      probFill.style.boxShadow = '0 0 12px #ef4444';
      riskChip.textContent = '▲ High Risk';
      riskChip.className = 'risk-chip hi';
    } else if (p >= 0.33) {
      probFill.style.background = '#f59e0b';
      probFill.style.boxShadow = '0 0 12px #f59e0b';
      riskChip.textContent = '◆ Medium Risk';
      riskChip.className = 'risk-chip md';
    } else {
      probFill.style.background = '#10b981';
      probFill.style.boxShadow = '0 0 12px #10b981';
      riskChip.textContent = '● Low Risk';
      riskChip.className = 'risk-chip lo';
    }
  }, 80);

  // Actions
  actList.innerHTML = '';
  const acts = mel
    ? ['Do not panic — this is a screening result, not a diagnosis.',
       'Book a dermatologist appointment within 1–2 weeks.',
       'Seek immediate care if lesion is bleeding, rapidly growing, or painful.',
       'Do not apply home remedies or attempt self-removal.',
       'Keep a dated photo record for medical comparison.']
    : ['Not a final diagnosis — continue periodic monitoring.',
       'Apply the ABCDE rule monthly to track changes.',
       'Re-examine the lesion every 1–2 months.',
       'Consult a dermatologist promptly if any change occurs.'];
  const cls = mel ? 'r' : 'g';
  acts.forEach((t, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="act-num ${cls}">${i + 1}</span><span>${t}</span>`;
    actList.appendChild(li);
  });

  // Show result
  resultWrap.style.display = 'block';
  setTimeout(() => resultWrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 200);
}

function showErr(m) {
  errMsg.textContent = m;
  errBar.classList.add('on');
}

function reset() {
  errBar.classList.remove('on');
  resultWrap.style.display = 'none';
  probFill.style.width = '0%';
}
