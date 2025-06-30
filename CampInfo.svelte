<script lang="ts">
	import { onMount } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	let countdown = {
		days: 0,
		hours: 0,
		minutes: 0,
		seconds: 0
	};

	// Track previous values to detect changes
	let prevCountdown = {
		days: 0,
		hours: 0,
		minutes: 0,
		seconds: 0
	};

	// Flash flags for each unit
	let flashDay = false;
	let flashHour = false;
	let flashMinute = false;
	let flashSecond = false;

	const eventEndDate = new Date('2025-07-04T17:00:01'); // 活動結束時間
	// 地圖位置的 Google Maps 連結
	const locations = {
		activity:
			'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3615.774712013287!2d121.53454321193558!3d25.007770077740933!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3442aa1e27ab738b%3A0x2e5be38c37583475!2z5ZyL56uL6Ie654Gj5bir56-E5aSn5a24IOWFrOmkqOagoeWNgA!5e0!3m2!1szh-TW!2stw!4v1743730247104!5m2!1szh-TW!2stw',
		dorm: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3615.367900441113!2d121.52431157429362!3d25.021585877824418!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3442a9fd810cbc83%3A0x38bf4a0a52f72137!2z5om_5pSc6KGM5peFIC0g5Y-w5YyX5Y-w5aSn6aSo!5e0!3m2!1szh-TW!2stw!4v1743789653775!5m2!1szh-TW!2stw'
	};

	let currentMap = locations.activity; // 預設顯示活動地點

	let stage; // 報名階段

	const now = new Date();
	if (now < new Date('2025-05-06T00:00:00')) {
		stage = 0; // 早鳥報名
	} else if (now < new Date('2025-05-20T00:00:00')) {
		stage = 1; // 一階報名
	} else if (now >= new Date('2025-05-23T00:00:00') && now < new Date('2025-06-02T00:00:00')) {
		stage = 2; // 二階報名
	} else if (now <= new Date('2025-07-01T10:00:00')) {
		stage = 3; // 報名已截止，活動即將開始
	} else if (now >= new Date('2025-07-01T21:30:00') && now <= new Date('2025-07-04T14:00:00')) {
		stage = 4; // 黑客松進行中
	} else if (now <= new Date('2025-07-04T17:00:00')) {
		stage = 5; // 活動進行中
	} else if (now > new Date('2025-07-04T17:00:00')) {
		stage = 6; // 活動已結束
	} else {
		stage = 7; // 非報名時段
	}

	let stageText = ''; // 報名階段文字

	let dateTexts = [
		'2025/04/21 - 2025/05/05', // 早鳥報名截止日期
		'2025/05/06 - 2025/05/19', // 一階報名截止日期
		'2025/05/23 - 2025/06/01', // 二階報名截止日期
		'', // 報名已截止
		'', // 活動即將開始
		'', // 黑客松倒數
		'', // 活動已結束
		'（剩餘名額將在 5/23 開放二階報名）', // 非報名時段

	];

	if (stage === 0) {
		stageText = '早鳥報名：' + dateTexts[stage];
	} else if (stage === 1) {
		stageText = '一階報名：' + dateTexts[stage];
	} else if (stage === 2) {
		stageText = '二階報名：' + dateTexts[stage];
	} else if (stage === 7) {
		stageText = '暫不受理報名 ' + dateTexts[stage];
	} else {
		stageText = '報名已截止' + dateTexts[stage];
	}

	let stageCostText = ''; // 報名費用文字

	let originalCostText = ''; // 原始報名費用
	if (stage === 0) {
		originalCostText = '7400';
		stageCostText = '6900 元'; // 早鳥報名費用
	} else if (stage === 1) {
		originalCostText = '';
		stageCostText = '7400 元'; // 一階報名費用
	} else if (stage === 2) {
		originalCostText = '';
		stageCostText = '7400 元'; // 二階報名費用
	} else if (stage === 7) {
		originalCostText = '';
		stageCostText = '7400 元'; // 非報名時段
	} else {
		originalCostText = '';
		stageCostText = '7400 元 (報名已截止)'; // 報名已截止
	} 

	stageCostText += ' / 清寒 3500 元';

	let stageCountDownText = '';
	let stageTitle = '報名已截止';

	if (stage === 3) {
		stageCountDownText = '距離活動開始剩餘';
	} else if (stage === 4) {
		stageCountDownText = '距離黑客松結束剩餘';
	} else if (stage === 5) {
		stageCountDownText = '距離活動結束剩餘';
	} else if (stage === 6) {
		stageTitle = '活動圓滿結束，感謝大家的參與！';
	} else {
		stageCountDownText = '距離報名截止剩餘';
	}

	let isCountdownActive = true;
	const secondsProgress = tweened(0, { duration: 1000, easing: cubicOut });

	// 倒數計時邏輯
	const stageEndDates = [
		new Date('2025-05-06T00:00:00'), // 早鳥報名結束
		new Date('2025-05-20T00:00:00'), // 一階報名結束
		new Date('2025-06-02T00:00:00'), // 二階報名結束
		new Date('2025-07-01T10:00:00'), // 活動開始
		new Date('2025-07-04T14:00:00'), // 黑客松結束
		new Date('2025-07-04T17:00:00'), // 活動結束
		null // 活動已結束或非報名時段
	];

	$: countdownTarget = stageEndDates[stage]; // 根據 stage 設定倒數目標時間

	onMount(() => {
		const interval = setInterval(() => {
			const now = new Date();
			const diff = countdownTarget ? countdownTarget.getTime() - now.getTime() : null;

			if (diff === null || diff <= 0) {
				clearInterval(interval);
				isCountdownActive = false;
				countdown = {
					days: 0,
					hours: 0,
					minutes: 0,
					seconds: 0
				};
			} else {
				// Store previous values
				prevCountdown = { ...countdown };

				countdown = {
					days: Math.floor(diff / (1000 * 60 * 60 * 24)),
					hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
					minutes: Math.floor((diff / (1000 * 60)) % 60),
					seconds: Math.floor((diff / 1000) % 60)
				};

				// Check for changes and trigger flashes
				if (prevCountdown.days !== countdown.days) {
					flashDay = true;
					setTimeout(() => (flashDay = false), 500);
				}
				if (prevCountdown.hours !== countdown.hours) {
					flashHour = true;
					setTimeout(() => (flashHour = false), 500);
				}
				if (prevCountdown.minutes !== countdown.minutes) {
					flashMinute = true;
					setTimeout(() => (flashMinute = false), 500);
				}
				// Always flash seconds as they change every time
				flashSecond = true;
				setTimeout(() => (flashSecond = false), 500);

				secondsProgress.set(countdown.seconds / 60);
			}
		}, 1000);

		return () => clearInterval(interval);
	});

	// 切換地圖位置
	function switchLocation(location: 'activity' | 'dorm') {
		currentMap = locations[location];
	}
</script>

<section class="mb-20 text-pretty" id="CampInfo">
	<div class="my-3">
		<span class="text-4xl">營隊資訊</span>
	</div>
	<div class="border-3 border-white bg-black/40">
		{#if isCountdownActive}
			<div class="border-b-3 border-white p-7 text-center">
				<p class="mb-4 text-3xl">{stageCountDownText}</p>
				<div class="countdown-container">
					<div class="countdown-unit {flashDay ? 'flash' : ''}">
						<div class="countdown-value">{countdown.days}</div>
						<div class="countdown-label">天</div>
					</div>
					<div class="countdown-separator">:</div>
					<div class="countdown-unit {flashHour ? 'flash' : ''}">
						<div class="countdown-value">{countdown.hours}</div>
						<div class="countdown-label">時</div>
					</div>
					<div class="countdown-separator">:</div>
					<div class="countdown-unit {flashMinute ? 'flash' : ''}">
						<div class="countdown-value">{countdown.minutes}</div>
						<div class="countdown-label">分</div>
					</div>
					<div class="countdown-separator">:</div>
					<div class="countdown-unit {flashSecond ? 'flash' : ''}">
						<div class="countdown-value">{countdown.seconds}</div>
						<div class="countdown-label">秒</div>
					</div>
				</div>
			</div>
		{:else}
			<p class="border-b-3 border-white p-7 text-center text-3xl">{stageTitle}</p>
		{/if}
		<div class="m-7 grid w-[95%] grid-cols-[15%_85%] items-center justify-center gap-x-6 gap-y-6">
			<div class="w-full border-b-3 md:border-r-3 md:border-b-0 py-1 text-center text-3xl">報名時間</div>
			<div class="text-center md:text-left text-2xl">
				{stageText}
			</div>

			<div class="w-full border-b-3 md:border-r-3 md:border-b-0 py-1 text-center text-3xl">報名費用</div>
			<div class="text-center md:text-left text-2xl">
				<span class="text-xl text-red-500 line-through">{originalCostText}</span>
				{stageCostText}
			</div>

			<div class="w-full border-b-3 md:border-r-3 md:border-b-0 py-1 text-center text-3xl">活動時間</div>
			<div class="text-center md:text-left text-2xl">
				<div class="flex flex-col md:flex-row md:items-center">
					<div class="mb-2 md:mb-0">7/1 (二) - 7/4 (五)</div>
					<div class="md:ml-4 inline-block px-3 py-2 text-xl ">
						&lt;‹
						<a 
							href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=2025%20臺師大資工營&dates=20250701/20250705&details=2025%20臺師大資工營%20NTNU%20CSIE%20CAMP｜資遊你和我的師界%0A官網：https://camp.ntnucsie.info&location=國立臺灣師範大學%20公館校區"
							target="_blank"
							class="hover:text-yellow-300"
						>
							新增活動至 Google 日曆  
						</a>
						›&gt; <!--考慮用 "‖" 視覺上也可接受-->
					</div>
				</div>
			</div>
				

			<div class="w-full border-b-3 md:border-r-3 md:border-b-0 py-1 text-center text-3xl">詳細資訊</div>
			<div class="text-center md:text-left text-2xl">
				<a
					href="https://drive.google.com/file/d/1tVDKH31xWfpOBJMWEkedD96Vh1odnq_A/view?usp=sharing"
					target="_blank"
					class="hover:text-yellow-300">點此查看 活動簡章</a
				>
			</div>

			<button
				type="button"
				class="border-3 border-white px-1 py-2 text-center text-3xl hover:cursor-pointer hover:bg-yellow-300 hover:text-black"
				on:click={() => switchLocation('activity')}
				on:keydown={(e) => e.key === 'Enter' && switchLocation('activity')}
			>
				活動地點
			</button>
			<span class="text-center md:text-left text-2xl"> 國立臺灣師範大學 公館校區 </span>

			<button
				type="button"
				class="border-3 border-white px-1 py-2 text-center text-3xl hover:cursor-pointer hover:bg-yellow-300 hover:text-black"
				on:click={() => switchLocation('dorm')}
				on:keydown={(e) => e.key === 'Enter' && switchLocation('dorm')}
			>
				住宿地點
			</button>
			<span class="text-center md:text-left text-2xl">
				<a 
					href="https://guidehotel.com.tw/hotel-detail/346" 
					target="_blank"
					class="hover:text-yellow-300"> 承攜行旅-台北台大館 </a><br />
					（臺北市中正區羅斯福路三段 98 號）
			</span>
		</div>

		<div class="mx-auto my-5 aspect-[752/345] w-[90%] overflow-hidden rounded-lg">
			<iframe
				title="Location Map"
				src={currentMap}
				class="h-full w-full border-0"
				allowfullscreen
				loading="lazy"
			>
			</iframe>
		</div>
	</div>
</section>

<style>
	.countdown-container {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1rem;
		margin: 1rem 0;
	}

	.countdown-unit {
		position: relative;
		background-color: rgba(0, 0, 0, 0.5);
		border: 3px solid white;
		border-radius: 0.5rem;
		padding: 1rem;
		width: 6rem;
		overflow: hidden;
		transition: transform 0.3s ease;
	}

	@media (max-width: 768px) {
	#CampInfo .grid {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100% !important;
		max-width: 100%;
		padding: 0 1rem;
		box-sizing: border-box;
		margin-left: auto;
		margin-right: auto;
	}
}


	@media (max-width: 640px) {
		.countdown-container {
			gap: 0.5rem;
		}

		.countdown-unit {
			padding: 0.5rem;
			width: 4rem;
		}

		.countdown-value {
			font-size: 1.75rem !important;
		}

		.countdown-label {
			font-size: 0.75rem !important;
		}

		.countdown-separator {
			font-size: 1.5rem !important;
		}
	}

	@media (max-width: 380px) {
		.countdown-unit {
			padding: 0.25rem;
			width: 3rem;
		}

		.countdown-value {
			font-size: 1.25rem !important;
		}

		.countdown-label {
			font-size: 0.625rem !important;
		}

		.countdown-separator {
			font-size: 1rem !important;
		}
	}

	.flash {
		animation: flash-background 1s ease-out forwards;
	}

	@keyframes flash-background {
		0% {
			background-color: rgba(255, 255, 0, 0.8);
		}
		20% {
			background-color: rgba(255, 255, 0, 0.8);
		}
		50% {
			background-color: rgba(0, 0, 0, 0.5);
		}
		90% {
			background-color: rgba(0, 0, 0, 0.5);
		}
		100% {
			background-color: rgba(255, 255, 0, 0.8);
		}
	}

	.countdown-value {
		font-size: 2.5rem;
		font-weight: bold;
		text-align: center;
		text-shadow: 0 0 10px rgba(255, 255, 255, 0.7);
		z-index: 2;
		position: relative;
	}

	.countdown-label {
		text-align: center;
		font-size: 1rem;
		margin-top: 0.5rem;
		color: rgba(255, 255, 255, 0.8);
	}

	.countdown-separator {
		font-size: 2rem;
		font-weight: bold;
		align-self: center;
	}
</style>
