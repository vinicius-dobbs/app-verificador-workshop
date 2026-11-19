import { createNativeStackNavigator } from "@react-navigation/native-stack";
import VerificationScreen from "../screens/VerificationScreen";
import ResultScreen from "../screens/ResultScreen";
import CredentialSelectionScreen from "../screens/CredentialSelectionScreen";
import StorefrontScreen from "../screens/StorefrontScreen";
import AgeCheckScreen from "../screens/AgeCheckScreen";
import SuccessScreen from "../screens/SuccessScreen";
import UnderageScreen from "../screens/UnderageScreen";
import type { CredentialOption } from "../services/certifyService";
import type { VPResult } from "../services/verifyService";

export type RootStackParamList = {
  CredentialSelection: undefined;
  Storefront: { credential: CredentialOption };
  AgeCheck: { credential: CredentialOption };
  Success: { requestId: string };
  Underage: undefined;
  Verification: { credential: CredentialOption };
  Result: { requestId: string; credential: CredentialOption; result: VPResult };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CredentialSelection" component={CredentialSelectionScreen} />
      <Stack.Screen name="Storefront" component={StorefrontScreen} />
      <Stack.Screen name="AgeCheck" component={AgeCheckScreen} />
      <Stack.Screen name="Success" component={SuccessScreen} />
      <Stack.Screen name="Underage" component={UnderageScreen} />
      <Stack.Screen name="Verification" component={VerificationScreen} />
      <Stack.Screen name="Result" component={ResultScreen} />
    </Stack.Navigator>
  );
}
