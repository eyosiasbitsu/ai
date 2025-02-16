import { SubscriptionButton } from "@/components/subscription-button";
import { checkSubscription } from "@/lib/subscription";

const SettingsPage = async () => {
  const isPro = await checkSubscription();

  return ( 
    <div className="h-full p-4 space-y-4">
      <h3 className="text-lg font-medium">Settings</h3>
      <div className="text-sm text-muted-foreground">
        {isPro ? (
          <p>You are currently on a Pro plan</p>
        ) : (
          <p>You are currently on a Free plan</p>
        )}
      </div>
      <div className="space-y-4">
        <div className="text-xs text-muted-foreground">
          {isPro ? (
            "You have access to all premium features"
          ) : (
            "Upgrade to Pro to unlock all features"
          )}
        </div>
        <SubscriptionButton isPro={isPro} />
      </div>
    </div>
   );
}
 
export default SettingsPage;
