import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CreateEvalProvider, useCreateEval } from "../context/create_eval_context";

export default function CreateEvaluationScreen() {
  return (
    <CreateEvalProvider>
      <CreateEvaluationContent />
    </CreateEvalProvider>
  );
}

function CreateEvaluationContent() {
  const {
    courseName,
    groupCategoryNames,
    name,
    setName,
    selectedGroup,
    selectGroup,
    deadline,
    setDeadline,
    visibility,
    selectVisibility,
    isCreating,
    isFormValid,
    onCreateTapped,
    goBack,
  } = useCreateEval();

  return (
    <SafeAreaView style={styles.screen}>
      <Header courseName={courseName} onBack={goBack} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <SectionLabel text="Evaluation Name" />
        <View style={styles.gap8} />
        <NameField value={name} onChange={setName} />

        <View style={styles.gap24} />
        <SectionLabel text="Select target group" />
        <View style={styles.gap8} />
        <GroupDropdown
          options={groupCategoryNames}
          selected={selectedGroup}
          onSelect={selectGroup}
        />

        <View style={styles.gap24} />
        <SectionLabel text="Time window" />
        <View style={styles.gap8} />
        <TimeWindowRow deadline={deadline} onDeadlineChange={setDeadline} />

        <View style={styles.gap24} />
        <SectionLabel text="Visibility" />
        <View style={styles.gap12} />
        <VisibilitySelector visibility={visibility} onSelect={selectVisibility} />

        <View style={styles.gap32} />
      </ScrollView>

      <CreateButton
        isCreating={isCreating}
        isFormValid={isFormValid}
        onPress={onCreateTapped}
      />
    </SafeAreaView>
  );
}

// ─── Header ────────────────────────────────────────────────────────────────

function Header({ courseName, onBack }: { courseName: string; onBack: () => void }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.8}>
        <Ionicons name="chevron-back" color="#ffffff" size={22} />
      </TouchableOpacity>
      <View style={styles.headerTextGap} />
      <View>
        <Text style={styles.headerTitle}>New Evaluation</Text>
        <Text style={styles.headerSubtitle}>{courseName}</Text>
      </View>
    </View>
  );
}

// ─── Section Label ──────────────────────────────────────────────────────────

function SectionLabel({ text }: { text: string }) {
  return <Text style={styles.sectionLabel}>{text}</Text>;
}

// ─── Name Field ─────────────────────────────────────────────────────────────

function NameField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <TextInput
      style={styles.textInput}
      value={value}
      onChangeText={onChange}
      placeholder="e.g. Sprint 3 peer review"
      placeholderTextColor="#5A5A5A"
    />
  );
}

// ─── Group Dropdown ──────────────────────────────────────────────────────────

function GroupDropdown({
  options,
  selected,
  onSelect,
}: {
  options: string[];
  selected: string | null;
  onSelect: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View>
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setOpen((o) => !o)}
        activeOpacity={0.8}
      >
        <Text style={selected ? styles.dropdownValueText : styles.dropdownHintText}>
          {selected ?? "Select a group category"}
        </Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          color="#ffffff"
          size={20}
        />
      </TouchableOpacity>

      {open && (
        <View style={styles.dropdownMenu}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={styles.dropdownItem}
              onPress={() => {
                onSelect(opt);
                setOpen(false);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.dropdownItemText}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Time Window ─────────────────────────────────────────────────────────────

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function formatDate(dt: Date): string {
  return `${MONTHS[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`;
}

function formatTime(dt: Date): string {
  const hour = dt.getHours() % 12 === 0 ? 12 : dt.getHours() % 12;
  const minute = dt.getMinutes().toString().padStart(2, "0");
  const period = dt.getHours() < 12 ? "AM" : "PM";
  return `${hour}:${minute} ${period}`;
}

function TimeWindowRow({
  deadline,
  onDeadlineChange,
}: {
  deadline: Date;
  onDeadlineChange: (dt: Date) => void;
}) {
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  return (
    <View style={styles.timeRow}>
      <TouchableOpacity
        style={styles.timeButton}
        onPress={() => setShowDate(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.timeButtonText}>{formatDate(deadline)}</Text>
      </TouchableOpacity>

      <View style={styles.timeGap} />

      <TouchableOpacity
        style={styles.timeButton}
        onPress={() => setShowTime(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.timeButtonText}>{formatTime(deadline)}</Text>
      </TouchableOpacity>

      {showDate && (
        <DateTimePicker
          value={deadline}
          mode="date"
          minimumDate={new Date()}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          themeVariant="dark"
          onChange={(_, date) => {
            setShowDate(false);
            if (date) {
              onDeadlineChange(
                new Date(date.getFullYear(), date.getMonth(), date.getDate(),
                  deadline.getHours(), deadline.getMinutes())
              );
            }
          }}
        />
      )}

      {showTime && (
        <DateTimePicker
          value={deadline}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          themeVariant="dark"
          onChange={(_, time) => {
            setShowTime(false);
            if (time) {
              const candidate = new Date(
                deadline.getFullYear(), deadline.getMonth(), deadline.getDate(),
                time.getHours(), time.getMinutes()
              );
              // No permitir deadlines en el pasado
              if (candidate > new Date()) {
                onDeadlineChange(candidate);
              }
            }
          }}
        />
      )}
    </View>
  );
}

// ─── Visibility Selector ─────────────────────────────────────────────────────

function VisibilitySelector({
  visibility,
  onSelect,
}: {
  visibility: "public" | "private";
  onSelect: (v: "public" | "private") => void;
}) {
  return (
    <View style={styles.visibilityRow}>
      <VisibilityCard
        icon="public"
        label="Public"
        subtitle="Visible to group"
        selected={visibility === "public"}
        onTap={() => onSelect("public")}
      />
      <View style={styles.visibilityGap} />
      <VisibilityCard
        icon="lock-outline"
        label="Private"
        subtitle="Only visible for me"
        selected={visibility === "private"}
        onTap={() => onSelect("private")}
      />
    </View>
  );
}

function VisibilityCard({
  icon,
  label,
  subtitle,
  selected,
  onTap,
}: {
  icon: string;
  label: string;
  subtitle: string;
  selected: boolean;
  onTap: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.visibilityCard, selected && styles.visibilityCardSelected]}
      onPress={onTap}
      activeOpacity={0.8}
    >
      <MaterialIcons
        name={icon as any}
        size={28}
        color={selected ? "#FF8C60" : "#9E9E9E"}
      />
      <View style={styles.gap8} />
      <Text style={[styles.visibilityLabel, selected && styles.visibilityLabelSelected]}>
        {label}
      </Text>
      <View style={styles.gap4} />
      <Text style={styles.visibilitySubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

// ─── Create Button ────────────────────────────────────────────────────────────

function CreateButton({
  isCreating,
  isFormValid,
  onPress,
}: {
  isCreating: boolean;
  isFormValid: boolean;
  onPress: () => void;
}) {
  return (
    <View style={styles.createButtonContainer}>
      <TouchableOpacity
        style={[styles.createButton, (!isFormValid || isCreating) && styles.createButtonDisabled]}
        onPress={onPress}
        disabled={!isFormValid || isCreating}
        activeOpacity={0.8}
      >
        {isCreating ? (
          <ActivityIndicator size="small" color="#FF8C60" />
        ) : (
          <Text style={styles.createButtonText}>+ Create evaluation</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#15100E",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    backgroundColor: "#231816",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTextGap: { width: 12 },
  headerTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Inter",
  },
  headerSubtitle: {
    color: "#9E9E9E",
    fontSize: 12,
    fontFamily: "Inter",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  sectionLabel: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Inter",
  },
  textInput: {
    backgroundColor: "#231816",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#ffffff",
    fontSize: 14,
    fontFamily: "Inter",
  },
  dropdown: {
    backgroundColor: "#231816",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownHintText: {
    color: "#5A5A5A",
    fontSize: 14,
    fontFamily: "Inter",
  },
  dropdownValueText: {
    color: "#ffffff",
    fontSize: 14,
    fontFamily: "Inter",
  },
  dropdownMenu: {
    backgroundColor: "#231816",
    borderRadius: 8,
    marginTop: 4,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#ffffff0f",
  },
  dropdownItemText: {
    color: "#ffffff",
    fontSize: 14,
    fontFamily: "Inter",
  },
  timeRow: {
    flexDirection: "row",
  },
  timeButton: {
    backgroundColor: "#231816",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  timeButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontFamily: "Inter",
  },
  timeGap: { width: 12 },
  visibilityRow: {
    flexDirection: "row",
  },
  visibilityGap: { width: 12 },
  visibilityCard: {
    flex: 1,
    paddingVertical: 20,
    backgroundColor: "#231816",
    borderRadius: 12,
    alignItems: "center",
  },
  visibilityCardSelected: {
    backgroundColor: "#3A2016",
    borderWidth: 1.5,
    borderColor: "#FF8C60",
  },
  visibilityLabel: {
    color: "#9E9E9E",
    fontSize: 15,
    fontWeight: "bold",
    fontFamily: "Inter",
  },
  visibilityLabelSelected: {
    color: "#FF8C60",
  },
  visibilitySubtitle: {
    color: "#9E9E9E",
    fontSize: 11,
    fontFamily: "Inter",
  },
  createButtonContainer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },
  createButton: {
    backgroundColor: "#3A2016",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  createButtonDisabled: {
    backgroundColor: "#231816",
  },
  createButtonText: {
    color: "#FF8C60",
    fontSize: 15,
    fontWeight: "bold",
    fontFamily: "Inter",
  },
  gap4: { height: 4 },
  gap8: { height: 8 },
  gap12: { height: 12 },
  gap24: { height: 24 },
  gap32: { height: 32 },
});
