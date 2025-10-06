/*-*-coding:utf-8 -*-
 *Auto updated?
 *   Yes
 *File:
 *   script.js
 *Author:
 *   CreativeCodeCat [wayne6324@gmail.com]
 *Github:
 *   https://github.com/CreativeCodeCat/
 *
 *Created:
 *   Thu 07 August 2025, 01:46:29 PM [GMT+1]
 *Modified:
 *   Mon 06 October 2025, 03:54:11 PM [GMT+1]
 *
 *Description:
 *   Cute Fantasy RPG – Player Sprite Creator Tool
 *
 *Dependencies:
 *   HTML, CSS, JavaScript
 **/

const bodyCanvas = document.getElementById("body_canvas");
const bodyCtx = bodyCanvas.getContext("2d");

const toolsCanvas = document.getElementById("tools_canvas");
const toolsCtx = toolsCanvas.getContext("2d");

// Asset arrays
var playerBase = [[]],
	chest = [[]],
	legs = [[]],
	feet = [[]],
	hands = [[]],
	hair = [[]],
	accessories = [[]],
	mounts = [[]];

var walkIdleRows = [],
	rollJumpRows = [],
	horseRidingRows = [];

var toolsByFolder = {};
var selectedToolsFolder = {};

// Selections
var selectedPlayerBase = [1],
	selectedChest = [0],
	selectedLegs = [0],
	selectedFeet = [0],
	selectedHands = [0],
	selectedHair = [0],
	selectedAccessories = [0],
	selectedMounts = [0];

document.getElementById("selectFiles").onchange = function () {
	initializeCharacterAssetsFolder();
};

document.getElementById("toggleNumbers").onchange = function () {
	// changing toggle numbers affects combined previews + final canvas
	createCombinedAnimationsPerAnimation();
	setupAnimationClickListeners();
	createFullExportedCanvasFromActiveAnimations();
	setupCustomDisplay();
};

function initializeCharacterAssetsFolder() {
	document.getElementById("export-controls").style.display = "block";
	document.getElementById("animations-number").style.display = "block";
	document.getElementById("final-exported-canvas").style.display = "block";
	document.getElementById("randomize-selection").style.display = "inline-block";

	playerBase = [[]];
	chest = [[]];
	legs = [[]];
	feet = [[]];
	hands = [[]];
	hair = [[]];
	accessories = [[]];
	mounts = [[]];
	toolsByFolder = {};
	selectedToolsFolder = {};

	// 🔹 Get new files
	const fileInput = document.getElementById("selectFiles");
	const selectedFiles = Array.from(fileInput.files).map((file) => ({
		name: file.name,
		path: file.webkitRelativePath,
		file: file,
	}));

	// 🔹 Process new files
	selectedFiles.forEach(composeResource);

	// 🔹 Sort and rebuild UI
	sort();
	initializeOptions();
	draw();
	setupCustomDisplay();

	// 🔹 Clear file input so future uploads replace everything
	fileInput.value = "";
}

function composeResource(fileObj) {
	const path = fileObj.path.split("/");
	if (!path[path.length - 1].endsWith(".png")) return;

	switch (path[1]) {
		case "Player_Base":
			generateResource(playerBase, fileObj);
			break;
		case "Chest":
			generateResource(chest, fileObj);
			break;
		case "Legs":
			generateResource(legs, fileObj);
			break;
		case "Feet":
			generateResource(feet, fileObj);
			break;
		case "Hands":
			generateResource(hands, fileObj);
			break;
		case "Hair":
			generateResource(hair, fileObj);
			break;
		case "Accessories":
			generateResource(accessories, fileObj);
			break;
		case "Player_Mounts":
			generateResource(mounts, fileObj);
			break;
		case "Tools":
			const folder = path[2];
			if (!toolsByFolder[folder]) {
				toolsByFolder[folder] = [];
				selectedToolsFolder[folder] = [0];
			}
			toolsByFolder[folder].push(fileObj);
			break;
		default:
			console.warn("Unrecognized folder:", path[1], "for file:", fileObj.name);
	}
}

function generateResource(arr, fileObj) {
	// ensure arr[0] exists
	if (!Array.isArray(arr[0])) arr[0] = [];
	arr[0].push(fileObj);
}

function sort() {
	[playerBase, chest, legs, feet, hands, hair, accessories, mounts].forEach((assetGroup) => {
		assetGroup.forEach((arr) => {
			arr.sort((a, b) => a.name.localeCompare(b.name));
			arr.unshift({ name: "none", file: null });
		});
	});

	Object.keys(toolsByFolder).forEach((folder) => {
		toolsByFolder[folder].sort((a, b) => a.name.localeCompare(b.name));
		toolsByFolder[folder].unshift({ name: "none", file: null });
	});
}

function getRandomSelection(arr) {
	if (!arr || !arr[0] || arr[0].length <= 1) return [0]; // If no valid options, return 'none'
	const options = arr[0];
	const randomIndex = Math.floor(Math.random() * (options.length - 1)) + 1;
	return [randomIndex];
}

function getRandomToolSelections(toolsArr) {
	if (!toolsArr || toolsArr.length <= 1) return [0];
	const randomIndex = Math.floor(Math.random() * toolsArr.length);
	return [randomIndex];
}

function getRandomAccessoriesSelection(arr) {
	if (!arr || !arr[0] || arr[0].length <= 1) return [0]; // If no valid options, return 'none'
	const options = arr[0];
	const randomIndex = Math.floor(Math.random() * options.length);
	return [randomIndex];
}

function randomizeSelections() {
	selectedPlayerBase = getRandomSelection(playerBase);
	selectedChest = getRandomSelection(chest);
	selectedLegs = getRandomSelection(legs);
	selectedFeet = getRandomSelection(feet);
	selectedHands = getRandomSelection(hands);
	selectedHair = getRandomSelection(hair);
	selectedAccessories = getRandomAccessoriesSelection(accessories);
	selectedMounts = getRandomSelection(mounts);

	// Object.keys(toolsByFolder).forEach(folder => {
	//     selectedToolsFolder[folder] = getRandomToolSelections(toolsByFolder[folder]);
	// });

	// Update all the <select> elements to reflect the new selections
	function updateSelect(id, selectedArr) {
		const select = document.getElementById(id);
		if (select) {
			Array.from(select.options).forEach((option, i) => {
				option.selected = selectedArr.includes(parseInt(option.value));
			});
		}
	}

	updateSelect("selectedPlayerBase", selectedPlayerBase);
	updateSelect("selectedChest", selectedChest);
	updateSelect("selectedLegs", selectedLegs);
	updateSelect("selectedFeet", selectedFeet);
	updateSelect("selectedHands", selectedHands);
	updateSelect("selectedHair", selectedHair);
	updateSelect("selectedAccessories", selectedAccessories);
	updateSelect("selectedMounts", selectedMounts);

	// Object.keys(toolsByFolder).forEach(folder => {
	//     updateSelect(`selectedToolsFolder_${folder}`, selectedToolsFolder[folder]);
	// });

	draw();
}

function initializeOptions() {
	const div = document.getElementById("selection");
	div.innerHTML = "";

	function addOptionGroup(label, arr, selectedVar, id) {
		div.appendChild(
			renderOptionGroup(
				label,
				(arr[0] || []).map((x) => x.name),
				id,
				selectedVar,
				function (e) {
					if (id.startsWith("selectedToolsFolder_")) {
						const folderName = id.replace("selectedToolsFolder_", "");
						selectedToolsFolder[folderName] = Array.from(e.target.selectedOptions).map((opt) => parseInt(opt.value));
						clearToolCheckCache();
					} else {
						window[id] = Array.from(e.target.selectedOptions).map((opt) => parseInt(opt.value));
					}
					draw();
				}
			)
		);
	}

	addOptionGroup("Player Base", playerBase, selectedPlayerBase, "selectedPlayerBase");
	addOptionGroup("Chest", chest, selectedChest, "selectedChest");
	addOptionGroup("Legs", legs, selectedLegs, "selectedLegs");
	addOptionGroup("Feet", feet, selectedFeet, "selectedFeet");
	addOptionGroup("Hands", hands, selectedHands, "selectedHands");
	addOptionGroup("Hair", hair, selectedHair, "selectedHair");
	addOptionGroup("Accessories", accessories, selectedAccessories, "selectedAccessories");
	addOptionGroup("Mounts", mounts, selectedMounts, "selectedMounts");

	Object.keys(toolsByFolder).forEach((folder) => {
		const folderId = `selectedToolsFolder_${folder}`;
		addOptionGroup(`Tools - ${folder}`, [toolsByFolder[folder]], selectedToolsFolder[folder] || [0], folderId);
	});

	draw();
}

function renderOptionGroup(label, options, id, selected, onChange) {
	const group = document.createElement("div");
	group.className = "select-group";

	const labelElem = document.createElement("label");
	labelElem.innerText = label;
	group.appendChild(labelElem);

	const select = document.createElement("select");
	select.id = id;
	select.multiple = true;
	select.size = 5;
	select.addEventListener("change", onChange);

	options.forEach((option, i) => {
		const opt = document.createElement("option");
		opt.value = i;
		opt.innerText = option;
		if (Array.isArray(selected) && selected.includes(i)) opt.selected = true;
		select.appendChild(opt);
	});

	group.appendChild(select);
	return group;
}

const frameSize = 64;
const numAnimations = 56;
const animationSpeed = 175;

const framesPerAnimationArray = [6, 6, 6, 6, 6, 6, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 6, 8, 8, 8, 1, 1, 1, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 9, 8, 9, 8, 8, 8, 2, 2, 2, 6, 6, 6];

const drawPositions = {
	Player_Base: [0, 0],
	Chest: [0, 0],
	Legs: [0, 0],
	Feet: [0, 0],
	Hands: [0, 0],
	Hair: [0, 0],
	Accessories: [0, 0],
	Player_Mounts: [0, 50],
	Tools: [0, 0],
};

const toolFolderFileOffsets = {
	Bow: { default: [0, 29] },
	Fishing_Rod: { default: [0, 44] },
	Iron: {
		Iron_Sword: [0, 6],
		Iron_Tools: [0, 32],
		default: [0, 0],
	},
	Copper: {
		Copper_Sword: [0, 6],
		Copper_Tools: [0, 32],
		default: [0, 0],
	},
	Other: {
		Lantern_Idle: [0, 20],
		Lantern_Running: [0, 23],
		Torch_Idle: [0, 20],
		Torch_Running: [0, 23],
		default: [0, 0],
	},
};

const meleeToolNames = ["Sword"]; // Add all melee tool base names you have
const rangedToolNames = ["Bow"]; // Add all ranged tool base names you have
const fishingToolNames = ["Fishing_Rod"]; // Add all fishing tool base names you have
const utilityToolNames = ["Tools"]; // Add all utility tool base names you have
const idleToolNames = ["Idle"]; // Add all idle tool base names you have
const runningToolNames = ["Running"]; // Add all running tool base names you have

const mountAnimations = [50, 51, 52, 53, 54, 55, 56];

const meleeAnimations = [6, 7, 8, 9, 10, 11, 12, 13, 14];
const rangedAnimations = [29, 30, 31];
const fishingAnimations = [44, 45, 46, 47, 48, 49];
const utilityAnimations = [32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43];
const idleAnimations = [20, 21, 22];
const runningAnimations = [23, 24, 25];

// ---------------- Image caching & loader ----------------
const imageCache = new Map();

/**

* Load images from file objects (uses a Map cache keyed by File object reference).
* Returns array of { img, x, y } results (skips nulls).
  */
async function loadImages(imgFiles) {
	const results = await Promise.all(
		(imgFiles || []).map(async ({ file, x, y }) => {
			if (!file) return null; // skip empty

			// Use cached image if exists (File objects are usable as keys while page loaded)
			if (imageCache.has(file)) {
				return { img: imageCache.get(file), x, y };
			}

			// Otherwise, load it and cache
			return new Promise((resolve, reject) => {
				const img = new Image();
				img.crossOrigin = "anonymous";
				img.onload = () => {
					// cache the Image instance (keeps the bitmap in memory; good for repeated draws)
					imageCache.set(file, img);
					// We can revoke the objectURL after load - img keeps the data.
					try {
						if (img.src && img.src.startsWith("blob:")) URL.revokeObjectURL(img.src);
					} catch (e) {
						// ignore revoke errors
					}
					resolve({ img, x, y });
				};
				img.onerror = (e) => {
					console.warn("Image failed to load", file, e);
					reject(e);
				};
				img.src = URL.createObjectURL(file);
			});
		})
	);

	return results.filter((r) => r !== null); // remove nulls
}

// ---------------- Helpers used by draw() ----------------
async function renderBodyFromFiles(imgFiles) {
	const loadedImages = await loadImages(imgFiles);
	bodyCtx.clearRect(0, 0, bodyCanvas.width, bodyCanvas.height);
	loadedImages.forEach(({ img, x, y }) => bodyCtx.drawImage(img, x, y));
}

async function renderToolsFromFiles(imgFiles) {
	const loadedImages = await loadImages(imgFiles);
	toolsCtx.clearRect(0, 0, toolsCanvas.width, toolsCanvas.height);
	loadedImages.forEach(({ img, x, y }) => toolsCtx.drawImage(img, x, y));
}

// ---------------- hasSelectedTool with caching ----------------
// Global cache map
const toolCheckCache = new Map();

/**

* Check if any selected tools match a given set of names within folders.
* Uses caching for repeated checks. Call clearToolCheckCache() when selections change.
*
* @param {string|string[]} folderNames - Folder(s) to check
* @param {string|string[]} toolNames - Tool name(s) to look for
* @returns {boolean} True if at least one tool is selected
  */
function hasSelectedTool(folderNames, toolNames) {
	const folders = Array.isArray(folderNames) ? folderNames : [folderNames];
	const names = Array.isArray(toolNames) ? toolNames : [toolNames];

	const cacheKey = folders.join(",") + "|" + names.join(",");
	if (toolCheckCache.has(cacheKey)) return toolCheckCache.get(cacheKey);

	const result = folders.some((folder) => {
		const selectedIndices = selectedToolsFolder[folder];
		const toolList = toolsByFolder[folder] || [];
		if (!selectedIndices || !toolList) return false;

		return selectedIndices.some((rawIdx) => {
			const idx = Number(rawIdx);
			if (!Number.isFinite(idx) || idx === 0) return false;
			const toolName = toolList[idx]?.name || "";
			return names.some((name) => name && toolName.includes(name));
		});
	});

	toolCheckCache.set(cacheKey, result);
	return result;
}

function clearToolCheckCache() {
	toolCheckCache.clear();
}

// ---------------- Central animation scheduler ----------------
/**

* Single scheduler that drives:
* * combined-anim preview canvases (small canvases generated from body/tools canvases)
* * demo canvases that draw frames from final_canvas (walk/roll/horse previews)
*
* Each registered task has:
* { type: 'combined'|'demo', canvas, drawFn, frameCount, frames (array), currentFrame, lastAdvance }
  */
const animationTasks = [];
let schedulerRunning = false;
let schedulerLastTimestamp = 0;

function schedulerRegisterTask(task) {
	// task: { id?, canvas, drawFn (timestamp->void), frameTime (ms) }
	animationTasks.push(Object.assign({ currentFrame: 0, lastAdvance: 0 }, task));
}

function schedulerClearTasks() {
	animationTasks.length = 0;
}

/**

* Main loop. Uses requestAnimationFrame, respects document.visibilityState.
  */
function animatePreviews(timestamp) {
	if (!schedulerRunning) return; // allow external stop
	if (!schedulerLastTimestamp) schedulerLastTimestamp = timestamp;

	// If tab hidden, skip updates (but still leave scheduler running so it can resume)
	if (document.hidden) {
		schedulerLastTimestamp = timestamp;
		requestAnimationFrame(animatePreviews);
		return;
	}

	const delta = timestamp - schedulerLastTimestamp;

	// Update each task: call task.drawFn with timestamp and task object
	for (let t of animationTasks) {
		// Each task provides a draw function responsible for advancing frames if needed.
		try {
			t.drawFn(timestamp, t);
		} catch (e) {
			console.error("Animation task draw error", e);
		}
	}

	schedulerLastTimestamp = timestamp;
	requestAnimationFrame(animatePreviews);
}

function startScheduler() {
	if (schedulerRunning) return;
	schedulerRunning = true;
	schedulerLastTimestamp = 0;
	requestAnimationFrame(animatePreviews);
}

function stopScheduler() {
	schedulerRunning = false;
}

// Pause/resume with tab visibility
document.addEventListener("visibilitychange", () => {
	if (document.hidden) {
		// we pause heavy updates by not advancing frames (scheduler still runs but early-returns)
	} else {
		// resume: ensure scheduler is running
		startScheduler();
	}
});

// ---------------- Primary draw() (uses cache) ----------------
async function draw() {
	// clear per-draw caches that depend on selection
	clearToolCheckCache();

	if (window.selectedAnimations) {
		window.selectedAnimations.clear();
	}

	// Clear canvases
	bodyCtx.clearRect(0, 0, bodyCanvas.width, bodyCanvas.height);
	toolsCtx.clearRect(0, 0, toolsCanvas.width, toolsCanvas.height);

	const bodyImgFiles = [];
	const toolsImgFiles = [];

	// Collect function for body parts
	function collect(arr, selected, name) {
		if (!Array.isArray(arr) || !Array.isArray(arr[0])) return;
		if (arr === mounts && selected[0] === 0) return;
		selected.forEach((index) => {
			const fileObj = arr[0][index];
			if (index > 0 && fileObj && fileObj.file) {
				let [x, y] = drawPositions[name] || [0, 0];
				bodyImgFiles.push({ file: fileObj.file, x: x * frameSize, y: y * frameSize });
			}
		});
	}

	collect(playerBase, selectedPlayerBase, "Player_Base");
	collect(chest, selectedChest, "Chest");
	collect(legs, selectedLegs, "Legs");
	collect(feet, selectedFeet, "Feet");
	collect(hands, selectedHands, "Hands");
	collect(hair, selectedHair, "Hair");
	collect(accessories, selectedAccessories, "Accessories");
	collect(mounts, selectedMounts, "Player_Mounts");

	// Collect tools
	Object.keys(toolsByFolder).forEach((folder) => {
		const toolList = toolsByFolder[folder] || [];
		const selectedList = selectedToolsFolder[folder] || [];
		selectedList.forEach((index) => {
			const fileObj = toolList[index];
			if (index > 0 && fileObj && fileObj.file) {
				const toolName = fileObj.name.split(".")[0];
				const folderOffsets = toolFolderFileOffsets[folder] || {};
				const [tx, ty] = folderOffsets[toolName] || folderOffsets["default"] || [0, 0];
				toolsImgFiles.push({ file: fileObj.file, x: tx * frameSize, y: ty * frameSize });
			}
		});
	});

	// Use the image cache loader then draw
	const [loadedBodyImages, loadedToolsImages] = await Promise.all([loadImages(bodyImgFiles), loadImages(toolsImgFiles)]);

	// Draw cached body images
	loadedBodyImages.forEach(({ img, x, y }) => {
		bodyCtx.drawImage(img, x, y);
	});

	// Draw cached tool images
	loadedToolsImages.forEach(({ img, x, y }) => {
		toolsCtx.drawImage(img, x, y);
	});

	// Rebuild exported animation and UI
	createCombinedAnimationsPerAnimation();
	setupAnimationClickListeners();
	createFullExportedCanvasFromActiveAnimations();
	setupCustomDisplay();
}

// ---------------- Combined previews & demo registration ----------------
function createCombinedAnimationsPerAnimation() {
	// Clear scheduler tasks and rebuilt set of tasks
	const container = document.getElementById("animationsCombined");
	if (!container) return;
	container.innerHTML = "";
	schedulerClearTasks(); // we'll re-register combined animation tasks and demo tasks later in setupCustomDisplay

	const skipMounts = selectedMounts.length === 1 && selectedMounts[0] === 0;
	const hasMelee = hasSelectedTool(["Iron", "Copper"], meleeToolNames);
	const hasRanged = hasSelectedTool("Bow", rangedToolNames);
	const hasFishing = hasSelectedTool("Fishing_Rod", fishingToolNames);
	const hasUtility = hasSelectedTool(["Iron", "Copper"], utilityToolNames);
	const hasIdle = hasSelectedTool("Other", idleToolNames);
	const hasRunning = hasSelectedTool("Other", runningToolNames);

	for (let animIndex = 0; animIndex < numAnimations; animIndex++) {
		if (skipMounts && mountAnimations.includes(animIndex)) {
			const hr = document.getElementById("horse_ride_canvas");
			if (hr) hr.style.display = "none";
			continue;
		} else {
			const hr = document.getElementById("horse_ride_canvas");
			if (hr) hr.style.display = "inline-block";
		}
		if (!hasMelee && meleeAnimations.includes(animIndex)) continue;
		if (!hasRanged && rangedAnimations.includes(animIndex)) continue;
		if (!hasFishing && fishingAnimations.includes(animIndex)) continue;
		if (!hasUtility && utilityAnimations.includes(animIndex)) continue;
		if (!hasIdle && idleAnimations.includes(animIndex)) continue;
		if (!hasRunning && runningAnimations.includes(animIndex)) continue;

		const frameCount = framesPerAnimationArray[animIndex] || 0;
		if (frameCount <= 0) continue;

		// Build combined frames for this animation index (composite of bodyCanvas/toolsCanvas)
		const combinedFrames = [];
		const bodyFirst = bodyFirstAnimations.includes(animIndex);

		for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
			const combinedCanvas = document.createElement("canvas");
			combinedCanvas.width = frameSize;
			combinedCanvas.height = frameSize;
			const combinedCtx = combinedCanvas.getContext("2d");

			// draw either body then tools or tools then body
			if (bodyFirst) {
				combinedCtx.drawImage(bodyCanvas, frameIndex * frameSize, animIndex * frameSize, frameSize, frameSize, 0, 0, frameSize, frameSize);
				combinedCtx.drawImage(toolsCanvas, frameIndex * frameSize, animIndex * frameSize, frameSize, frameSize, 0, 0, frameSize, frameSize);
			} else {
				combinedCtx.drawImage(toolsCanvas, frameIndex * frameSize, animIndex * frameSize, frameSize, frameSize, 0, 0, frameSize, frameSize);
				combinedCtx.drawImage(bodyCanvas, frameIndex * frameSize, animIndex * frameSize, frameSize, frameSize, 0, 0, frameSize, frameSize);
			}

			if (document.getElementById("toggleNumbers")?.checked) {
				combinedCtx.fillStyle = "white";
				combinedCtx.font = "12px VT323";
				combinedCtx.fillText(animIndex, 2, 10);
			}

			combinedFrames.push(combinedCanvas);
		}

		// create preview canvas
		const animCanvas = document.createElement("canvas");
		animCanvas.id = `combined-anim-${animIndex}`;
		animCanvas.width = frameSize;
		animCanvas.height = frameSize;
		animCanvas.classList.add("combined-preview");
		container.appendChild(animCanvas);

		// register this preview to the scheduler
		schedulerRegisterTask({
			id: `combined-${animIndex}`,
			canvas: animCanvas,
			frames: combinedFrames,
			frameCount: combinedFrames.length,
			frameTime: animationSpeed,
			drawFn: (timestamp, task) => {
				// simple frame advancing based on elapsed ms since lastAdvance
				const now = timestamp || performance.now();
				if (!task.lastAdvance) task.lastAdvance = now;
				const elapsed = now - task.lastAdvance;
				if (!task.currentFrame && task.currentFrame !== 0) task.currentFrame = 0;
				if (elapsed >= (task.frameTime || animationSpeed)) {
					task.currentFrame = (task.currentFrame + 1) % task.frameCount;
					task.lastAdvance = now;
				}
				const ctx = task.canvas.getContext("2d");
				ctx.clearRect(0, 0, task.canvas.width, task.canvas.height);
				ctx.drawImage(task.frames[task.currentFrame], 0, 0);
			},
		});
	}

	// After building combined previews, register demo tasks in setupCustomDisplay() which expects combined previews exist.
	// start scheduler
	startScheduler();
}

// ---------------- Demo previews registration (moved into scheduler) ----------------
function setupCustomDisplay() {
	document.getElementById("animationsWithBackground").style.display = "block";

	// build demo configs
	const demos = [
		{
			canvasId: "walk_idle_canvas",
			rows: walkIdleRows,
			animations: [
				{ name: "idle_up", rowIndex: 2, x: 75, y: 50, frames: 4 },
				{ name: "idle_down", rowIndex: 0, x: 75, y: 100, frames: 4 },
				{ name: "idle_left", rowIndex: 1, x: 50, y: 75, frames: 4, flip: true },
				{ name: "idle_right", rowIndex: 1, x: 100, y: 75, frames: 4 },
				{ name: "walk_up", rowIndex: 5, x: 75, y: 10, frames: 4 },
				{ name: "walk_down", rowIndex: 3, x: 75, y: 140, frames: 4 },
				{ name: "walk_left", rowIndex: 4, x: 10, y: 75, frames: 4, flip: true },
				{ name: "walk_right", rowIndex: 4, x: 140, y: 75, frames: 4 },
			],
		},
		{
			canvasId: "horse_ride_canvas",
			rows: horseRidingRows,
			animations: [
				{ name: "horseRide_up", rowIndex: 2, x: 75, y: 50, frames: 2 },
				{ name: "horseRide_down", rowIndex: 0, x: 75, y: 100, frames: 2 },
				{ name: "horseRide_left", rowIndex: 1, x: 50, y: 75, frames: 2, flip: true },
				{ name: "horseRide_right", rowIndex: 1, x: 100, y: 75, frames: 2 },
				{ name: "horseRun_up", rowIndex: 5, x: 75, y: 10, frames: 6 },
				{ name: "horseRun_down", rowIndex: 3, x: 75, y: 140, frames: 6 },
				{ name: "horseRun_left", rowIndex: 4, x: 10, y: 75, frames: 6, flip: true },
				{ name: "horseRun_right", rowIndex: 4, x: 140, y: 75, frames: 6 },
			],
		},
		{
			canvasId: "roll_jump_canvas",
			rows: rollJumpRows,
			animations: [
				{ name: "roll_up", rowIndex: 2, x: 75, y: 50, frames: 8 },
				{ name: "roll_down", rowIndex: 0, x: 75, y: 100, frames: 8 },
				{ name: "roll_left", rowIndex: 1, x: 50, y: 75, frames: 8, flip: true },
				{ name: "roll_right", rowIndex: 1, x: 100, y: 75, frames: 8 },
				{ name: "jump_up", rowIndex: 5, x: 75, y: 10, frames: 4 },
				{ name: "jump_down", rowIndex: 3, x: 75, y: 140, frames: 4 },
				{ name: "jump_left", rowIndex: 4, x: 10, y: 75, frames: 4, flip: true },
				{ name: "jump_right", rowIndex: 4, x: 140, y: 75, frames: 4 },
			],
		},
	];

	// The demo drawing relies on the exported sprite sheet (#final_canvas).
	// We'll register each demo canvas and its animations into the scheduler.
	const spriteSheet = document.getElementById("final_canvas");
	const backgroundImage = new Image();
	backgroundImage.crossOrigin = "anonymous";
	backgroundImage.src = "https://raw.githubusercontent.com/HeCodes2Much/Cute-Fantasy-RPG-Player-Generator/refs/heads/main/background.png";

	// Remove any existing demo tasks first
	// (We clear all tasks earlier in createCombinedAnimationsPerAnimation() so just re-register now.)
	demos.forEach((demo) => {
		const ctxElem = document.getElementById(demo.canvasId);
		if (!ctxElem) return;
		const ctx = ctxElem.getContext("2d");

		// Register a single scheduler task for this entire demo canvas.
		schedulerRegisterTask({
			id: `demo-${demo.canvasId}`,
			canvas: ctxElem,
			frameTime: 1000 / 60, // we'll use internal per-animation timers; but tick often to keep framerate smooth
			drawFn: (timestamp, task) => {
				// draw background
				const c = task.canvas;
				const ctx = c.getContext("2d");
				ctx.clearRect(0, 0, c.width, c.height);
				if (backgroundImage.complete) ctx.drawImage(backgroundImage, 0, 0, c.width, c.height);

				// Each animation in the demo has its own timing state inside the anim object
				demo.animations.forEach((anim) => {
					// initialize per-anim state
					anim._lastAdvance = anim._lastAdvance || timestamp || performance.now();
					anim._currentFrame = anim._currentFrame || 0;
					const now = timestamp || performance.now();
					const elapsed = now - anim._lastAdvance;
					const msPerFrame = animationSpeed; // use same animationSpeed for demo frames to keep consistent
					if (elapsed >= msPerFrame) {
						anim._currentFrame = (anim._currentFrame + 1) % anim.frames;
						anim._lastAdvance = now;
					}

					// spriteSheet may not exist yet (final_canvas). Guard usage.
					if (!spriteSheet) return;

					ctx.save();
					if (anim.flip) {
						ctx.translate(anim.x + frameSize, anim.y);
						ctx.scale(-1, 1);
						ctx.drawImage(spriteSheet, anim._currentFrame * frameSize, (demo.rows[anim.rowIndex] || 0) * frameSize, frameSize, frameSize, 0, 0, frameSize, frameSize);
					} else {
						ctx.drawImage(spriteSheet, anim._currentFrame * frameSize, (demo.rows[anim.rowIndex] || 0) * frameSize, frameSize, frameSize, anim.x, anim.y, frameSize, frameSize);
					}
					ctx.restore();
				});
			},
		});
	});

	// start scheduler (if not running)
	startScheduler();
}

// Global animation references for scheduler
let bodyFirstAnimations = [];
let toolsFirstAnimations = [];

// ---------------- Final export canvas creation ----------------
function createFullExportedCanvasFromActiveAnimations() {
	try {
		const container = document.getElementById("animationsCombined");
		if (!container) {
			console.warn("No #animationsCombined container found.");
			return;
		}

		// Use the in-memory bodyCanvas/toolsCanvas (they are drawn by draw())
		if (!bodyCanvas || !toolsCanvas) {
			console.error("body_canvas or tools_canvas not found.");
			return;
		}

		// Gather combined-anim canvases indices from DOM
		const animCanvases = Array.from(container.querySelectorAll("canvas"));
		let animIndices = animCanvases
			.map((c) => {
				const m = c.id.match(/combined-anim-(\d+)/);
				return m ? parseInt(m[1], 10) : NaN;
			})
			.filter((i) => Number.isFinite(i));

		const selectedAnimArray = Array.from(window.selectedAnimations || []);
		if (selectedAnimArray.length > 0) {
			animIndices = animIndices.filter((i) => selectedAnimArray.includes(i));
		}

		if (animIndices.length === 0) {
			const skipMounts = selectedMounts.length === 1 && selectedMounts[0] === 0;
			const hasMelee = hasSelectedTool("Combat", meleeToolNames);
			const hasRanged = hasSelectedTool("Combat", rangedToolNames);
			const hasFishing = hasSelectedTool("Utility", fishingToolNames);
			const hasUtility = hasSelectedTool("Utility", utilityToolNames);
			const hasIdle = hasSelectedTool("Other", idleToolNames);
			const hasRunning = hasSelectedTool("Other", runningToolNames);

			for (let animIndex = 0; animIndex < numAnimations; animIndex++) {
				if (skipMounts && mountAnimations.includes(animIndex)) continue;
				if (!hasMelee && meleeAnimations.includes(animIndex)) continue;
				if (!hasRanged && rangedAnimations.includes(animIndex)) continue;
				if (!hasFishing && fishingAnimations.includes(animIndex)) continue;
				if (!hasUtility && utilityAnimations.includes(animIndex)) continue;
				if (!hasIdle && idleAnimations.includes(animIndex)) continue;
				if (!hasRunning && runningAnimations.includes(animIndex)) continue;
				animIndices.push(animIndex);
			}
		}

		if (animIndices.length === 0) {
			console.warn("No animations detected to export.");
			return;
		}

		const animFrames = [];
		let maxFrames = 0;
		for (const animIndex of animIndices) {
			const frameCount = framesPerAnimationArray[animIndex];
			if (!frameCount || frameCount <= 0) {
				console.warn(`Skipping anim ${animIndex} (no frames).`);
				continue;
			}
			animFrames.push({ animIndex, frameCount });
			if (frameCount > maxFrames) maxFrames = frameCount;
		}

		if (animFrames.length === 0) {
			console.warn("No valid animation frames found to export.");
			return;
		}

		const showNumbers = document.getElementById("toggleNumbers")?.checked === true;
		const finalCanvas = document.createElement("canvas");
		finalCanvas.id = "final_canvas";
		finalCanvas.className = "final_canvas";
		finalCanvas.width = (maxFrames + (showNumbers ? 1 : 0)) * frameSize;
		finalCanvas.height = animFrames.length * frameSize;

		const finalCtx = finalCanvas.getContext("2d");
		if (finalCtx) finalCtx.imageSmoothingEnabled = false;

		const bodyFirstArray = Array.isArray(window.bodyFirstAnimations) ? window.bodyFirstAnimations : [];

		walkIdleRows.splice(0, walkIdleRows.length);
		rollJumpRows.splice(0, rollJumpRows.length);
		horseRidingRows.splice(0, horseRidingRows.length);

		for (let row = 0; row < animFrames.length; row++) {
			const { animIndex, frameCount } = animFrames[row];
			const bodyFirst = bodyFirstArray.includes(animIndex);
			const dy = row * frameSize;

			for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
				const sx = frameIndex * frameSize;
				const sy = animIndex * frameSize;
				const dx = frameIndex * frameSize;

				if (bodyFirst) {
					finalCtx.drawImage(bodyCanvas, sx, sy, frameSize, frameSize, dx, dy, frameSize, frameSize);
					finalCtx.drawImage(toolsCanvas, sx, sy, frameSize, frameSize, dx, dy, frameSize, frameSize);
				} else {
					finalCtx.drawImage(toolsCanvas, sx, sy, frameSize, frameSize, dx, dy, frameSize, frameSize);
					finalCtx.drawImage(bodyCanvas, sx, sy, frameSize, frameSize, dx, dy, frameSize, frameSize);
				}
			}

			if (showNumbers) {
				const numX = maxFrames * frameSize + frameSize / 2;
				finalCtx.fillStyle = "#00000000";
				finalCtx.fillRect(maxFrames * frameSize, dy, frameSize, frameSize);

				finalCtx.fillStyle = "#fff";
				finalCtx.font = `${Math.floor(frameSize * 0.4)}px monospace`;
				finalCtx.textAlign = "center";
				finalCtx.textBaseline = "middle";
				finalCtx.fillText(row, numX, dy + frameSize / 2);
			}

			function inRange(value, min, max) {
				return value >= min && value <= max;
			}

			if (inRange(animIndex, 0, 5)) {
				walkIdleRows.push(row);
			} else if (inRange(animIndex, 17, 19) || inRange(animIndex, 26, 28)) {
				rollJumpRows.push(row);
			} else if (inRange(animIndex, 50, 55)) {
				horseRidingRows.push(row);
			}
		}

		const exportContainer = document.getElementById("final-exported-canvas");
		if (!exportContainer) {
			console.error("#final-exported-canvas not found.");
			return;
		}
		const oldCanvas = exportContainer.querySelector("#final_canvas");
		if (oldCanvas) exportContainer.replaceChild(finalCanvas, oldCanvas);
		else exportContainer.appendChild(finalCanvas);

		console.log("Export complete — final_canvas appended to #final-exported-canvas");
		return finalCanvas;
	} catch (err) {
		console.error("Error while creating export:", err);
	}
}

// ---------------- Download button ----------------
const downloadButton = document.getElementById("download-sprite");
if (downloadButton) {
	downloadButton.addEventListener("click", () => {
		const finalCanvas = document.getElementById("final_canvas");
		if (!finalCanvas) {
			alert("Canvas not ready yet!");
			return;
		}
		const dataURL = finalCanvas.toDataURL("image/png");

		const link = document.createElement("a");
		link.href = dataURL;
		link.download = "sprite-sheet.png";
		link.click();
	});
}

// ---------------- Selected animations set & click handlers ----------------
window.selectedAnimations = new Set();

function setupAnimationClickListeners() {
	document.querySelectorAll('[id^="combined-anim-"]').forEach((canvas) => {
		canvas.style.cursor = "pointer"; // show pointer cursor on hover

		canvas.removeEventListener("click", canvas._clickHandler || (() => {}));
		const handler = () => {
			const m = canvas.id.match(/combined-anim-(\d+)/);
			if (!m) return;
			const animNum = parseInt(m[1], 10);
			if (window.selectedAnimations.has(animNum)) {
				window.selectedAnimations.delete(animNum);
				canvas.classList.remove("selected");
			} else {
				window.selectedAnimations.add(animNum);
				canvas.classList.add("selected");
			}
			console.log("Selected animations:", Array.from(window.selectedAnimations));
			createFullExportedCanvasFromActiveAnimations();
		};
		canvas._clickHandler = handler;
		canvas.addEventListener("click", handler);
	});
}

// ---------------- Initialize scheduler at file load ----------------
// Start scheduler (it will early-return if tab hidden)
startScheduler();
