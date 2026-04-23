const uploadForm = document.getElementById("uploadForm");
const imageInput = document.getElementById("imageInput");
const previewImage = document.getElementById("previewImage");
const previewPlaceholder = document.getElementById("previewPlaceholder");
const predictBtn = document.getElementById("predictBtn");

const resultCard = document.getElementById("resultCard");
const riskBadge = document.getElementById("riskBadge");
const resultLabel = document.getElementById("resultLabel");
const resultProbability = document.getElementById("resultProbability");
const probabilityFill = document.getElementById("probabilityFill");
const probabilityScale = document.getElementById("probabilityScale");
const resultInterpretation = document.getElementById("resultInterpretation");
const resultDisclaimer = document.getElementById("resultDisclaimer");
const errorCard = document.getElementById("errorCard");
const postResultSection = document.getElementById("postResultSection");
const melanomaActions = document.getElementById("melanomaActions");
const nonMelanomaActions = document.getElementById("nonMelanomaActions");

imageInput.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) {
    previewImage.classList.add("hidden");
    previewPlaceholder.classList.remove("hidden");
    return;
  }

  const fileReader = new FileReader();
  fileReader.onload = (e) => {
    previewImage.src = e.target?.result;
    previewImage.classList.remove("hidden");
    previewPlaceholder.classList.add("hidden");
  };
  fileReader.readAsDataURL(file);
});

uploadForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const selectedFile = imageInput.files?.[0];
  if (!selectedFile) {
    showError("Please select an image before predicting.");
    return;
  }

  if (selectedFile.size > 5 * 1024 * 1024) {
    showError("Large image detected. Use a clear, focused lesion image for best results.");
    return;
  }

  resetMessages();
  predictBtn.disabled = true;
  predictBtn.textContent = "Analyzing...";

  const formData = new FormData();
  formData.append("file", selectedFile);

  try {
    const response = await fetch("/predict", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (!response.ok || data.status !== "success") {
      throw new Error(data.message || "Prediction request failed.");
    }

    const probabilityPct = (data.melanoma_probability * 100).toFixed(2);
    const isMelanoma = data.predicted_label === "Melanoma";
    const probabilityNum = Number(data.melanoma_probability);

    if (isMelanoma) {
      resultLabel.textContent = "Screening Alert: Possible Melanoma Pattern Detected";
      riskBadge.textContent = "Screening Alert";
      riskBadge.className =
        "mt-2 inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-rosealert";
      resultInterpretation.textContent =
        "This screening model is tuned for high sensitivity, so it is less likely to miss melanoma. Some benign lesions may still be flagged, which is expected for safer screening. Clinical confirmation is required.";
    } else {
      resultLabel.textContent = "Low Risk: Likely Non-Melanoma";
      riskBadge.textContent = "Lower Risk";
      riskBadge.className =
        "mt-2 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700";
      resultInterpretation.textContent =
        "This is a screening result, not a final diagnosis. Continue monitoring the lesion and consult a dermatologist if any changes occur.";
    }

    resultProbability.textContent = `Melanoma Probability: ${probabilityNum.toFixed(2)} (${probabilityPct}%)`;

    if (probabilityFill && probabilityScale) {
      probabilityFill.style.width = `${Math.max(0, Math.min(100, Number(probabilityPct)))}%`;
      if (probabilityNum >= 0.66) {
        probabilityFill.style.backgroundColor = "#dc2626";
        probabilityScale.textContent = "Risk Level: High";
      } else if (probabilityNum >= 0.33) {
        probabilityFill.style.backgroundColor = "#f59e0b";
        probabilityScale.textContent = "Risk Level: Medium";
      } else {
        probabilityFill.style.backgroundColor = "#10b981";
        probabilityScale.textContent = "Risk Level: Low";
      }
    }

    resultDisclaimer.textContent = data.disclaimer || "";

    resultLabel.className = isMelanoma
      ? "mt-2 text-2xl font-extrabold text-rosealert"
      : "mt-2 text-2xl font-extrabold text-mint";

    resultCard.classList.remove("hidden");

    if (postResultSection) {
      postResultSection.classList.remove("hidden");
    }
    if (melanomaActions && nonMelanomaActions) {
      melanomaActions.classList.toggle("hidden", !isMelanoma);
      nonMelanomaActions.classList.toggle("hidden", isMelanoma);
    }

    if (postResultSection) {
      setTimeout(() => {
        postResultSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 350);
    }
  } catch (error) {
    showError(error.message || "Unexpected error while predicting.");
  } finally {
    predictBtn.disabled = false;
    predictBtn.textContent = "Predict Melanoma Probability";
  }
});

function showError(message) {
  errorCard.textContent = message;
  errorCard.classList.remove("hidden");
}

function resetMessages() {
  errorCard.classList.add("hidden");
  resultCard.classList.add("hidden");
  if (probabilityFill) {
    probabilityFill.style.width = "0%";
    probabilityFill.style.backgroundColor = "#10b981";
  }
  if (probabilityScale) {
    probabilityScale.textContent = "";
  }
  if (postResultSection) {
    postResultSection.classList.add("hidden");
  }
  if (melanomaActions) {
    melanomaActions.classList.add("hidden");
  }
  if (nonMelanomaActions) {
    nonMelanomaActions.classList.add("hidden");
  }
}
