import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  useEvalForm,
  evalCriteria,
  scoreOptions,
  EvalFormProvider,
} from "../context/eval_form_context";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EvalFormScreen() {
  return (
    <EvalFormProvider>
      <EvalFormContent />
    </EvalFormProvider>
  );
}

function EvalFormContent() {
  const { isLoading, peers } = useEvalForm();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#BB3322" size="large" />
      </View>
    );
  }

  if (peers.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No peers to evaluate.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Header />
        <ProgressSection />
        <FormBody />
        <BottomButton />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Header() {
  const navigation = useNavigation<any>();
  const { evaluation, courseName, elapsedTime } = useEvalForm();

  return (
    <View style={styles.headerWrap}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerGap} />

        <View style={styles.headerTitles}>
          <Text style={styles.headerTitle}>
            {evaluation?.name ?? "Peer evaluation"}
          </Text>
          <Text style={styles.headerSub}>{courseName}</Text>
        </View>

        <View style={styles.timerBadge}>
          <Text style={styles.timerText}>{elapsedTime}</Text>
        </View>
      </View>
    </View>
  );
}

function ProgressSection() {
  const { peers, currentIndex, doneCount } = useEvalForm();
  const current = peers.length > 0 ? currentIndex + 1 : 0;
  const total = peers.length;
  const progress = total > 0 ? doneCount / total : 0;

  return (
    <View style={styles.progressWrap}>
      <View style={styles.progressRow}>
        <Text style={styles.progressText}>
          Peer {current} of {total}
        </Text>
        <Text style={styles.progressText}>
          {doneCount}/{total} done
        </Text>
      </View>
      <View style={styles.progressBarTrack}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${Math.max(0, Math.min(1, progress)) * 100}%` },
          ]}
        />
      </View>
    </View>
  );
}

function FormBody() {
  const { currentPeer } = useEvalForm();

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.formContent}
      keyboardShouldPersistTaps="handled"
    >
      {currentPeer ? <PeerCard /> : null}

      <View style={styles.sectionGap} />
      {evalCriteria.map((criterion) => (
        <CriterionSection
          key={criterion.key}
          criterionKey={criterion.key}
          label={criterion.label}
        />
      ))}

      <View style={styles.sectionGapSmall} />
      <CommentSection />
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

function PeerCard() {
  const { currentPeer } = useEvalForm();
  if (!currentPeer) return null;

  return (
    <View style={styles.peerCard}>
      <View style={styles.peerAvatar}>
        <Text style={styles.peerAvatarText}>{currentPeer.initials}</Text>
      </View>
      <View style={styles.peerInfo}>
        <Text style={styles.peerName}>{currentPeer.fullName}</Text>
        <Text style={styles.peerEmail}>{currentPeer.email}</Text>
      </View>
    </View>
  );
}

function CriterionSection({
  criterionKey,
  label,
}: {
  criterionKey: string;
  label: string;
}) {
  const { currentScores, selectScore } = useEvalForm();

  return (
    <View style={styles.criterionBlock}>
      <Text style={styles.criterionLabel}>{label}</Text>
      <View style={styles.scoreRow}>
        {scoreOptions.map((option, index) => {
          const selected = currentScores[criterionKey] === option.value;
          return (
            <TouchableOpacity
              key={option.label}
              style={[
                styles.scoreOption,
                index !== scoreOptions.length - 1 && styles.scoreOptionGap,
                selected && styles.scoreOptionSelected,
              ]}
              onPress={() => selectScore(criterionKey, option.value)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.scoreValue,
                  selected && styles.scoreSelectedText,
                ]}
              >
                {option.value.toFixed(1)}
              </Text>
              <Text
                style={[
                  styles.scoreLabel,
                  selected && styles.scoreSelectedText,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function CommentSection() {
  const { currentComment, setCurrentComment } = useEvalForm();

  return (
    <View style={styles.commentBlock}>
      <View style={styles.commentTitleRow}>
        <Text style={styles.commentLabel}>Comments</Text>
        <Text style={styles.commentOptional}>Optional</Text>
      </View>
      <TextInput
        value={currentComment}
        onChangeText={setCurrentComment}
        placeholder="Add a comment about this peer..."
        placeholderTextColor="#5A5A5A"
        multiline
        style={styles.commentInput}
      />
    </View>
  );
}

function BottomButton() {
  const {
    isSubmitting,
    isFormValid,
    isLastPeer,
    nextPeerName,
    onNextOrSubmit,
  } = useEvalForm();

  const label = isLastPeer ? "Submit →" : `Next: ${nextPeerName} →`;

  return (
    <View style={styles.bottomWrap}>
      <TouchableOpacity
        style={[
          styles.bottomButton,
          (!isFormValid || isSubmitting) && styles.bottomButtonDisabled,
        ]}
        onPress={onNextOrSubmit}
        disabled={!isFormValid || isSubmitting}
        activeOpacity={0.85}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#FF8C60" size="small" />
        ) : (
          <Text style={styles.bottomButtonText}>{label}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#15100E",
  },
  flex: {
    flex: 1,
  },
  centered: {
    flex: 1,
    backgroundColor: "#15100E",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "rgba(255,255,255,0.7)",
    fontFamily: "Inter",
    fontSize: 15,
  },
  headerWrap: {
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#231816",
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    color: "#FFFFFF",
    fontSize: 22,
    marginTop: -2,
    fontFamily: "Inter",
  },
  headerGap: {
    width: 12,
  },
  headerTitles: {
    flex: 1,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Inter",
    fontWeight: "700",
  },
  headerSub: {
    marginTop: 2,
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
    fontFamily: "Inter",
  },
  timerBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#BB3322",
  },
  timerText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "Inter",
    fontWeight: "700",
  },
  progressWrap: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
    fontFamily: "Inter",
  },
  progressBarTrack: {
    height: 4,
    borderRadius: 999,
    backgroundColor: "#2A2A2A",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#BB3322",
    borderRadius: 999,
  },
  formContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  peerCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#231816",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  peerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#4A2B1F",
    justifyContent: "center",
    alignItems: "center",
  },
  peerAvatarText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Inter",
    fontWeight: "700",
  },
  peerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  peerName: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Inter",
    fontWeight: "600",
  },
  peerEmail: {
    marginTop: 2,
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
    fontFamily: "Inter",
  },
  sectionGap: {
    height: 20,
  },
  sectionGapSmall: {
    height: 8,
  },
  criterionBlock: {
    marginBottom: 20,
  },
  criterionLabel: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Inter",
    fontWeight: "700",
    marginBottom: 10,
  },
  scoreRow: {
    flexDirection: "row",
  },
  scoreOption: {
    flex: 1,
    backgroundColor: "#231816",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  scoreOptionGap: {
    marginRight: 6,
  },
  scoreOptionSelected: {
    backgroundColor: "#3A2016",
    borderColor: "#FF8C60",
    borderWidth: 1.5,
  },
  scoreValue: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Inter",
    fontWeight: "700",
  },
  scoreLabel: {
    marginTop: 4,
    color: "rgba(255,255,255,0.55)",
    fontSize: 10,
    fontFamily: "Inter",
  },
  scoreSelectedText: {
    color: "#FF8C60",
  },
  commentBlock: {
    marginTop: 4,
  },
  commentTitleRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  commentLabel: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Inter",
    fontWeight: "700",
  },
  commentOptional: {
    marginLeft: 8,
    color: "rgba(255,255,255,0.38)",
    fontSize: 12,
    fontFamily: "Inter",
  },
  commentInput: {
    marginTop: 10,
    backgroundColor: "#231816",
    color: "#FFFFFF",
    borderRadius: 10,
    minHeight: 104,
    textAlignVertical: "top",
    padding: 14,
    fontSize: 14,
    fontFamily: "Inter",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  bottomSpacer: {
    height: 16,
  },
  bottomWrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  bottomButton: {
    width: "100%",
    borderRadius: 12,
    backgroundColor: "#3A2016",
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomButtonDisabled: {
    backgroundColor: "#231816",
  },
  bottomButtonText: {
    color: "#FF8C60",
    fontSize: 15,
    fontFamily: "Inter",
    fontWeight: "600",
  },
});
