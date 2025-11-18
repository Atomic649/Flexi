import { useEffect, useState } from "react";
import { View } from "@/components/Themed";
import {
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";
import { CustomText } from "@/components/CustomText";
import { useTheme } from "@/providers/ThemeProvider";
import { useTranslation } from "react-i18next";
import { useBackgroundColorClass, useTextColorClass } from "@/utils/themeUtils";
import CallAPIMember from "@/api/member_api";
import CallAPIUser from "@/api/auth_api";
import { getBusinessId } from "@/utils/utility";
import CustomAlert from "@/components/CustomAlert";
import i18n from "@/i18n";

interface TeamMember {
  userId?: number;
  uniqueId: string;
  firstName: string;
  lastName: string;
  role: string;
  permission: string;
  status: string; // derived: request-sent | accepted
  avatar?: string;
}

export default function TeamScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
    buttons: [] as { text: string; onPress: () => void }[],
  });
  const [addVisible, setAddVisible] = useState(false);
  const [newUsername, setNewUsername] = useState("@");
  const roleOptions = ["owner", "marketing", "accountant", "sales"] as const;
  const [selectedRole, setSelectedRole] =
    useState<(typeof roleOptions)[number]>("sales");

  const fetchMembers = async () => {
    setLoading(true);
    setError("");
    try {
      const businessId = await getBusinessId();
      if (!businessId) {
        setError(t("auth.register.validation.invalidUserId"));
        setLoading(false);
        return;
      }
      const res = await CallAPIMember.getMembersByBusinessIdAPI(businessId);
      if (res?.members) {
        const list = (res.members as TeamMember[]) || [];
        // Always include current user in the list (without duplicating)
        const session = await CallAPIUser.getSessionAPI();
        const self = session?.session;
        if (self) {
          const selfFirst = (self.firstName || "").trim().toLowerCase();
          const selfLast = (self.lastName || "").trim().toLowerCase();
          const includesSelf = list.some((m: any) => {
            const f = (m.firstName || "").trim().toLowerCase();
            const l = (m.lastName || "").trim().toLowerCase();
            // Prefer userId match if available on payload; fallback to name match
            return (m.userId && m.userId === self.id) || (f === selfFirst && l === selfLast);
          });

          const listWithSelf: TeamMember[] = includesSelf
            ? list
            : [
                {
                  uniqueId: "self",
                  firstName: self.firstName || "",
                  lastName: self.lastName || "",
                  role: "owner",
                  permission: "owner",
                  status: "accepted",
                  avatar: self.avatar || "",
                },
                ...list,
              ];
          setMembers(listWithSelf);
        } else {
          setMembers(list);
        }
      } else if (res?.error) {
        throw new Error(res.error);
      }
    } catch (e: any) {
      console.error("Failed to fetch team members", e);
      setError(e.message || "Failed to load team members");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMembers();
  };

  // Invitations removed from UI; all members are shown directly

  return (
    <View
      className={`flex-1 ${useBackgroundColorClass()}`}
      style={{ paddingHorizontal: 16, paddingTop: 24 }}
    >
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <CustomText
            className={`text-2xl font-semibold pt-2 ${useTextColorClass()}`}
          >
            {t("team.title") || "Team Members"}
          </CustomText>
          <TouchableOpacity
            onPress={() => setAddVisible(true)}
            style={{
              backgroundColor: "#04ecc1",
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 10,
            }}
          >
            <CustomText style={{ color: "#0d0d0d", fontWeight: "700" }}>
              {t("team.addMember") || "Add Member"}
            </CustomText>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={{ paddingVertical: 40, alignItems: "center" }}>
            <ActivityIndicator color={theme === "dark" ? "#fff" : "#333"} />
          </View>
        )}
        {!loading && error && (
          <CustomText className="text-red-500 mb-4">{error}</CustomText>
        )}
        {!loading && !error && members.length === 0 && (
          <CustomText className={useTextColorClass()}>
            {t("team.empty") || "No team members found"}
          </CustomText>
        )}
        {!loading &&
          members.map((m) => (
            <View
              key={m.uniqueId}
              style={{
                marginBottom: 12,
                padding: 14,
                borderRadius: 12,
                backgroundColor: theme === "dark" ? "#2D2D2D" : "#f1f1f1",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-around",
                  alignItems: "center",
                  backgroundColor: "transparent",
                }}
              >
                <View
                  style={{
                    flex: 1,
                    flexDirection: "column",
                    backgroundColor: "transparent",
                    justifyContent: "space-around",
                    alignItems: "stretch",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",                      
                      backgroundColor: "transparent",
                      width: "100%",
                    }}
                  >
                    <CustomText
                      className="text-base font-medium"
                      style={{
                        color: theme === "dark" ? "#e5e5e5" : "#333",
                        flex: 1,
                      }}
                    >
                      {`${m.firstName} ${m.lastName}`}
                    </CustomText>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={{
                        backgroundColor: "#04ecc1",
                        paddingHorizontal: 14,
                        paddingVertical: 6,
                        borderRadius: 20,
                        marginLeft: 8,
                        justifyContent: "flex-end",
                      }}
                    >
                      <CustomText
                        style={{
                          color: "#0d0d0d",
                          fontWeight: "600",
                          fontSize: 12,
                        }}
                      >
                        {t(`team.roles.${m.role}`) || m.role}
                      </CustomText>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}
      </ScrollView>

      {/* Add Member Modal */}
      <Modal
        visible={addVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAddVisible(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
          activeOpacity={1}
          onPress={() => setAddVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={{
              width: "90%",
              maxWidth: 520,
              backgroundColor: theme === "dark" ? "#18181b" : "#fff",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <CustomText
              className="text-lg mb-3"
              style={{ color: theme === "dark" ? "#c9c9c9" : "#333" }}
            >
              {t("team.addMember") || "Add Member"}
            </CustomText>

            <CustomText
              style={{
                color: theme === "dark" ? "#b3b3b3" : "#555",
                marginBottom: 6,
              }}
            >
              {t("auth.register.username") || "Username"}
            </CustomText>
            <View
              style={{
                backgroundColor: theme === "dark" ? "#2D2D2D" : "#e1e1e1",
                borderRadius: 10,
                paddingHorizontal: 12,
                marginBottom: 12,
              }}
            >
              <TextInput
                value={newUsername}
                onChangeText={setNewUsername}
                placeholder="@"
                placeholderTextColor={theme === "dark" ? "#606060" : "#999"}
                style={{
                  height: 44,
                  color: theme === "dark" ? "#b1b1b1" : "#333",
                  fontFamily:
                    i18n.language === "th"
                      ? "IBMPlexSansThai-Medium"
                      : "Poppins-Regular",
                }}
              />
            </View>

            <CustomText
              style={{
                color: theme === "dark" ? "#b3b3b3" : "#555",
                marginBottom: 6,
              }}
            >
              {t("team.memberRole") || "Role"}
            </CustomText>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 12,
              }}
            >
              {roleOptions.map((r) => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setSelectedRole(r)}
                  activeOpacity={0.8}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor:
                      selectedRole === r
                        ? "#04ecc1"
                        : theme === "dark"
                        ? "#2D2D2D"
                        : "#e1e1e1",
                  }}
                >
                  <CustomText
                    style={{
                      color:
                        selectedRole === r
                          ? "#0d0d0d"
                          : theme === "dark"
                          ? "#b3b3b3"
                          : "#555",
                    }}
                  >
                    {t(`team.roles.${r}`) || r}
                  </CustomText>
                </TouchableOpacity>
              ))}
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                gap: 12,
              }}
            >
              <TouchableOpacity onPress={() => setAddVisible(false)}>
                <CustomText
                  style={{ color: theme === "dark" ? "#c9c9c9" : "#333",

                  }}

                >
                  {t("common.cancel") || "Cancel"}
                </CustomText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  try {
                    const businessId = await getBusinessId();
                    if (!businessId) throw new Error("Invalid businessId");
                    if (!newUsername.trim())
                      throw new Error("Username required");
                    const res = await CallAPIMember.inviteMemberByUsernameAPI({
                      username: newUsername.trim(),
                      role: selectedRole,
                      businessId,
                    });
                    if (res?.status === "ok") {
                      setAddVisible(false);
                      setNewUsername("");
                      await fetchMembers();
                      setAlertConfig({
                        visible: true,
                        title: t("common.success") || "Success",
                        message: `${t("team.addMember") || "Add Member"}: ${newUsername}`,
                        buttons: [
                          {
                            text: t("common.ok") || "OK",
                            onPress: () =>
                              setAlertConfig((p) => ({ ...p, visible: false })),
                          },
                        ],
                      });
                    }
                  } catch (e: any) {
                    setAlertConfig({
                      visible: true,
                      title: t("common.error") || "Error",
                      message: e?.message || "Failed to invite member",
                      buttons: [
                        {
                          text: t("common.ok") || "OK",
                          onPress: () =>
                            setAlertConfig((p) => ({ ...p, visible: false })),
                        },
                      ],
                    });
                  }
                }}
                style={{
                  backgroundColor: "#04ecc1",
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 10,
                }}
              >
                <CustomText style={{ color: "#0d0d0d", fontWeight: "700" }}>
                  {t("team.addMember") || "Add Member"}
                </CustomText>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
      />
    </View>
  );
}
