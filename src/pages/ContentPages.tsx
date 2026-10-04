import { site, events, speakers, clubs, schedule } from '../content';
import type { Speaker } from '../content/types';
import { PageHeading } from '../components/Layout';
import { EventCard, SpeakerCard, ClubCard } from '../components/Cards';
import { Media } from '../components/Media';
import { useState } from 'react';

function normalizeSpeakerName(value: string) {
	return value
		.replace(/\s*\([^)]*\)/g, ' ')
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function cleanPanelistName(value: string) {
	return value.replace(/\s*\([^)]*\)/g, '').trim();
}

function findSpeakerByName(name: string) {
	const normalizedQuery = normalizeSpeakerName(name);
	if (!normalizedQuery) return undefined;

	return speakers.find((speaker: Speaker) => {
		const normalizedSpeakerName = normalizeSpeakerName(speaker.name);
		return normalizedSpeakerName === normalizedQuery || normalizedSpeakerName.includes(normalizedQuery) || normalizedQuery.includes(normalizedSpeakerName);
	});
}

export function EventsPage() { return <div className="page-shell section-space"><PageHeading {...site.pages.events} /><div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{events.map(event => <EventCard key={event.id} event={event} />)}</div></div>; }
export function SpeakersPage() {
	const speakersByClub = speakers.reduce<Map<string, Speaker[]>>((groups, speaker) => {
		const club = speaker.club?.trim() || 'Other Speakers';
		const group = groups.get(club) ?? [];
		group.push(speaker);
		groups.set(club, group);
		return groups;
	}, new Map());

	return (
		<div className="page-shell section-space">
			<PageHeading {...site.pages.speakers} />
			<div className="space-y-12">
				{Array.from(speakersByClub, ([club, clubSpeakers]) => (
					<section key={club} aria-labelledby={`speakers-${club}`}>
						<h2 id={`speakers-${club}`} className="mb-6 border-b border-line pb-3 font-display text-2xl font-black uppercase">
							{club}
						</h2>
						<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
							{clubSpeakers.map((speaker) => (
								<SpeakerCard key={speaker.id} speaker={speaker} />
							))}
						</div>
					</section>
				))}
			</div>
			{site.pages.speakers.notice && <p className="mt-12 max-w-2xl border-t border-line pt-6 text-base leading-relaxed text-muted">{site.pages.speakers.notice}</p>}
		</div>
	);
}
export function ClubsPage() { return <div className="page-shell section-space"><PageHeading {...site.pages.clubs} /><div className="grid gap-6 md:grid-cols-2">{clubs.map((club, index) => <ClubCard key={club.id} club={club} index={index} />)}</div></div>; }
export function CalendarPage() {
	const [selectedDate, setSelectedDate] = useState('ALL');
	const [searchTerm, setSearchTerm] = useState('');
	const scheduleDates = [...new Set(schedule.map((item) => item.date))];
	const filteredSchedule = schedule.filter((item) => {
		const matchesDate = selectedDate === 'ALL' || item.date === selectedDate;
		const panelists = (item.panelists ?? [])
			.filter((panelist) => !/\(tentative\)/i.test(panelist))
			.map((panelist) => cleanPanelistName(panelist))
			.filter(Boolean);
		const searchContent = [item.date, item.time, item.title, item.club, item.venue, ...panelists]
			.join(' ')
			.toLowerCase();
		return matchesDate && searchContent.includes(searchTerm.trim().toLowerCase());
	});

	return (
		<div className="page-shell section-space">
			<PageHeading {...site.pages.calendar} />
			<div className="mb-6 flex flex-col gap-5 border-y border-line py-5 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-wrap gap-2" role="group" aria-label="Filter schedule by date">
					{['ALL', ...scheduleDates].map((date) => (
						<button
							key={date}
							type="button"
							aria-pressed={selectedDate === date}
							onClick={() => setSelectedDate(date)}
							className={`border px-3 py-2 text-sm font-bold transition-colors ${selectedDate === date ? 'border-brand bg-brand text-white' : 'border-line hover:bg-surface'}`}
						>
							{date === 'ALL' ? 'All dates' : date}
						</button>
					))}
				</div>
				<label className="flex min-w-0 items-center gap-3 sm:w-72">
					<span className="sr-only">Search schedule and speakers</span>
					<input
						type="search"
						value={searchTerm}
						onChange={(event) => setSearchTerm(event.target.value)}
						placeholder="Search sessions or speakers"
						className="w-full border border-line bg-canvas px-3 py-2 text-sm outline-none focus:border-brand"
					/>
				</label>
			</div>

			<div className="overflow-x-auto border-y border-line">
				<table className="w-full min-w-[850px] border-collapse text-left">
					<thead className="bg-surface/60 text-xs font-bold uppercase text-muted">
						<tr>
							<th className="px-4 py-3">Date &amp; time</th>
							<th className="px-4 py-3">Session</th>
							<th className="px-4 py-3">Club</th>
							<th className="px-4 py-3">Speakers</th>
							<th className="px-4 py-3">Venue</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-line">
						{filteredSchedule.map((item) => (
							<tr key={item.id} className="align-top transition-colors hover:bg-surface/40">
								<td className="whitespace-nowrap px-4 py-4 text-sm font-semibold">
									<span className="block text-brand">{item.date}</span>
									<span className="mt-1 block text-muted">{item.time}</span>
								</td>
								<th scope="row" className="px-4 py-4 font-display text-base font-black">{item.title}</th>
								<td className="px-4 py-4 text-sm text-muted">{item.club || '—'}</td>
								<td className="px-4 py-4">
									{(item.panelists ?? []).filter((panelist) => !/\(tentative\)/i.test(panelist)).length > 0 ? (
										<ul className="flex min-w-64 flex-wrap gap-3">
											{(item.panelists ?? [])
												.filter((panelist) => !/\(tentative\)/i.test(panelist))
												.map((panelist) => {
													const cleanName = cleanPanelistName(panelist);
													const matchedSpeaker = findSpeakerByName(cleanName);
													return (
														<li key={cleanName} className="flex items-center gap-2 text-sm">
															{matchedSpeaker?.image ? (
																<div className="flex size-10 shrink-0 overflow-hidden rounded-full border border-line bg-surface">
																	<Media media={matchedSpeaker.image} className="h-full w-full object-cover" />
																</div>
															) : (
																<span
																	className="flex size-10 shrink-0 items-center justify-center border border-line bg-surface text-[9px] font-bold text-muted"
																	role="img"
																	aria-label={`Photo placeholder for ${cleanName}`}
																>
																	PHOTO
																</span>
															)}
															<span className="max-w-36">{cleanName}</span>
														</li>
													);
												})}
										</ul>
									) : <span className="text-sm text-muted">To be announced</span>}
								</td>
								<td className="px-4 py-4 text-sm text-muted">{item.venue || '—'}</td>
							</tr>
						))}
						{filteredSchedule.length === 0 && (
							<tr>
								<td colSpan={5} className="px-4 py-12 text-center text-sm text-muted">
									No sessions match these filters.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
export function NotFoundPage() { return <div className="page-shell section-space"><PageHeading eyebrow="404" title="PAGE NOT FOUND." description="This page is not available. Return to Trade Winds to explore the events." /></div>; }
