import React, { useEffect, useMemo, useState } from "react";
import {
	Modal,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { CustomText } from "@/components/CustomText";
import {
	addMonths,
	eachDayOfInterval,
	endOfMonth,
	endOfWeek,
	format,
	isAfter,
	isBefore,
	isSameDay,
	isSameMonth,
	startOfMonth,
	startOfWeek,
	subMonths,
} from "date-fns";

type Props = {
	visible: boolean;
	value: Date;
	onChange: (next: Date) => void;
	onClose: () => void;
	minDate?: Date;
	maxDate?: Date;
};

const pad2 = (n: number) => String(n).padStart(2, "0");

const clampInt = (value: number, min: number, max: number) => {
	if (Number.isNaN(value)) return min;
	return Math.min(max, Math.max(min, value));
};

const digits2 = (text: string) => text.replace(/\D/g, "").slice(0, 2);

export default function DateTimePicker({
	visible,
	value,
	onChange,
	onClose,
	minDate,
	maxDate,
}: Props) {
	const { theme } = useTheme();

	const [cursorMonth, setCursorMonth] = useState<Date>(() => startOfMonth(value));
	const [selectedDate, setSelectedDate] = useState<Date>(() => new Date(value));
	const [hh, setHh] = useState(() => pad2(value.getHours()));
	const [mm, setMm] = useState(() => pad2(value.getMinutes()));

	useEffect(() => {
		if (!visible) return;
		setCursorMonth(startOfMonth(value));
		setSelectedDate(new Date(value));
		setHh(pad2(value.getHours()));
		setMm(pad2(value.getMinutes()));
	}, [visible, value]);

	const colors = useMemo(() => {
		const isDark = theme === "dark";
		return {
			overlay: isDark ? "#000000b5" : "#b4cac6a9",
			cardBg: isDark ? "#18181b" : "#ffffff",
			text: isDark ? "#ffffff" : "#222222",
			mutedText: isDark ? "#a1a1aa" : "#6b7280",
			border: isDark ? "#3f3f46" : "#e5e7eb",
			cellBg: isDark ? "#27272a" : "#f4f4f5",
			accent: "#04ecc1",
		};
	}, [theme]);

	const gridDays = useMemo(() => {
		const monthStart = startOfMonth(cursorMonth);
		const monthEnd = endOfMonth(cursorMonth);
		const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
		const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
		return eachDayOfInterval({ start: gridStart, end: gridEnd });
	}, [cursorMonth]);

	const isDisabled = (day: Date) => {
		if (minDate && isBefore(day, startOfDay(minDate))) return true;
		if (maxDate && isAfter(day, endOfDay(maxDate))) return true;
		return false;
	};

	const commit = () => {
		const hour = clampInt(parseInt(hh || "0", 10), 0, 23);
		const minute = clampInt(parseInt(mm || "0", 10), 0, 59);
		const next = new Date(selectedDate);
		next.setHours(hour, minute, 0, 0);
		onChange(next);
		onClose();
	};

	return (
		<Modal
			visible={visible}
			transparent
			animationType="none"
			onRequestClose={onClose}
		>
			<TouchableOpacity
				activeOpacity={1}
				onPress={onClose}
				style={[styles.overlay, { backgroundColor: colors.overlay }]}
			>
				<View
					style={[
						styles.card,
						{
							backgroundColor: colors.cardBg,
							borderColor: colors.border,
						},
					]}
					onStartShouldSetResponder={() => true}
					onTouchEnd={(e) => {
						// @ts-ignore
						e?.stopPropagation?.();
					}}
				>
					{/* Header */}
					<View style={styles.headerRow}>
						<TouchableOpacity
							onPress={() => setCursorMonth((d) => subMonths(d, 1))}
							style={[styles.navBtn, { borderColor: colors.border }]}
						>
							<CustomText style={{ color: colors.text }}>
								{"<"}
							</CustomText>
						</TouchableOpacity>
						<CustomText weight="bold" style={{ color: colors.text }}>
							{format(cursorMonth, "MMMM yyyy")}
						</CustomText>
						<TouchableOpacity
							onPress={() => setCursorMonth((d) => addMonths(d, 1))}
							style={[styles.navBtn, { borderColor: colors.border }]}
						>
							<CustomText style={{ color: colors.text }}>
								{">"}
							</CustomText>
						</TouchableOpacity>
					</View>

					{/* Weekdays */}
					<View style={styles.weekRow}>
						{["S", "M", "T", "W", "T", "F", "S"].map((d) => (
							<CustomText
								key={d}
								style={[styles.weekday, { color: colors.mutedText }]}
							>
								{d}
							</CustomText>
						))}
					</View>

					{/* Calendar grid */}
					<View style={styles.grid}>
						{gridDays.map((day) => {
							const outside = !isSameMonth(day, cursorMonth);
							const selected = isSameDay(day, selectedDate);
							const disabled = isDisabled(day);

							return (
								<TouchableOpacity
									key={day.toISOString()}
									disabled={disabled}
									onPress={() => {
										if (disabled) return;
										const next = new Date(selectedDate);
										next.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
										setSelectedDate(next);
									}}
									style={[
										styles.dayCell,
										{
											backgroundColor: selected
												? colors.accent
												: colors.cellBg,
											opacity: outside ? 0.45 : 1,
											borderColor: colors.border,
										},
									]}
								>
									<CustomText
										style={{
											color: selected ? "#0b0b0b" : colors.text,
											opacity: disabled ? 0.4 : 1,
										}}
									>
										{format(day, "d")}
									</CustomText>
								</TouchableOpacity>
							);
						})}
					</View>

					{/* Time inputs */}
					<View style={styles.timeRow}>
						<CustomText style={{ color: colors.mutedText }}>
							Time
						</CustomText>
						<View style={styles.timeInputs}>
							<TextInput
								value={hh}
								onChangeText={(txt) => setHh(digits2(txt))}
								onBlur={() => {
									const n = clampInt(parseInt(hh || "0", 10), 0, 23);
									setHh(pad2(n));
								}}
								keyboardType="number-pad"
								maxLength={2}
								style={[
									styles.timeInput,
									{ color: colors.text, borderColor: colors.border },
								]}
							/>
							<CustomText style={{ color: colors.mutedText }}>:</CustomText>
							<TextInput
								value={mm}
								onChangeText={(txt) => setMm(digits2(txt))}
								onBlur={() => {
									const n = clampInt(parseInt(mm || "0", 10), 0, 59);
									setMm(pad2(n));
								}}
								keyboardType="number-pad"
								maxLength={2}
								style={[
									styles.timeInput,
									{ color: colors.text, borderColor: colors.border },
								]}
							/>
						</View>
					</View>

					{/* Actions */}
					<View style={styles.actionRow}>
						<TouchableOpacity
							onPress={onClose}
							style={[styles.actionBtn, { borderColor: colors.border }]}
						>
							<CustomText style={{ color: colors.mutedText }}>Cancel</CustomText>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={commit}
							style={[
								styles.actionBtn,
								{ backgroundColor: colors.accent, borderColor: colors.accent },
							]}
						>
							<CustomText style={{ color: "#0b0b0b" }} weight="bold">
								Done
							</CustomText>
						</TouchableOpacity>
					</View>
				</View>
			</TouchableOpacity>
		</Modal>
	);
}

function startOfDay(d: Date) {
	const x = new Date(d);
	x.setHours(0, 0, 0, 0);
	return x;
}

function endOfDay(d: Date) {
	const x = new Date(d);
	x.setHours(23, 59, 59, 999);
	return x;
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 16,
	},
	card: {
		width: "100%",
		maxWidth: 420,
		borderRadius: 16,
		padding: 14,
		borderWidth: 1,
	},
	headerRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 10,
	},
	navBtn: {
		width: 38,
		height: 38,
		borderRadius: 10,
		borderWidth: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	weekRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 8,
	},
	weekday: {
		width: "14.2857%",
		textAlign: "center",
		fontSize: 12,
	},
	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
	},
	dayCell: {
		width: "14.2857%",
		aspectRatio: 1,
		borderRadius: 10,
		borderWidth: 1,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 6,
	},
	timeRow: {
		marginTop: 10,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	timeInputs: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	timeInput: {
		width: 54,
		height: 38,
		borderWidth: 1,
		borderRadius: 10,
		textAlign: "center",
		fontSize: 16,
	},
	actionRow: {
		marginTop: 14,
		flexDirection: "row",
		justifyContent: "flex-end",
		gap: 10,
	},
	actionBtn: {
		paddingVertical: 10,
		paddingHorizontal: 14,
		borderRadius: 12,
		borderWidth: 1,
		minWidth: 92,
		alignItems: "center",
	},
});

