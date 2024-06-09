// EnthusiastProfile.tsx

import React, { useState } from "react";
import useTwoFactorAuthentication from "../../hooks/authentication/useTwoFactorAuthentication";

interface EnthusiastProfileProps {
  onComplete: () => void; // Define the onComplete function type
}

const EnthusiastProfile: React.FC<EnthusiastProfileProps> = ({
  onComplete,
}) => {
  const [profileSettings, setProfileSettings] = useState({
    badges: true,
    achievements: true,
    privacySettings: {
      twoFactorAuth: true,
      encryption: true,
    },
  });

  const { isTwoFactorEnabled, enableTwoFactor, disableTwoFactor } = useTwoFactorAuthentication();

  const handleComplete = () => {
    onComplete(); // Call the onComplete function passed from the parent component
  };

  const toggleBadges = () => {
    setProfileSettings({ ...profileSettings, badges: !profileSettings.badges });
  };

  const toggleAchievements = () => {
    setProfileSettings({
      ...profileSettings,
      achievements: !profileSettings.achievements,
    });
  };

  const toggleTwoFactorAuth = () => {
    // Toggle the two-factor authentication setting using the custom hook functions
    if (isTwoFactorEnabled) {
      disableTwoFactor();
    } else {
      enableTwoFactor();
    }
    setProfileSettings({
      ...profileSettings,
      privacySettings: {
        ...profileSettings.privacySettings,
        twoFactorAuth: !isTwoFactorEnabled, // Toggle the value
      },
    });
  };


  const toggleEncryption = () => {
    setProfileSettings({
      ...profileSettings,
      privacySettings: {
        ...profileSettings.privacySettings,
        encryption: !profileSettings.privacySettings.encryption,
      },
    });
  };

  return (
    <div>
      <h3>Enthusiast Profile</h3>
      {/* Profile Setup and Customization */}
      <section>
        <h4>Profile Setup and Customization</h4>
        <p>
          Set up your profile and customize it with badges and achievements to
          showcase your trading journey and accomplishments in the crypto space.
        </p>
        {/* Toggles for badges and achievements */}

        <div>
          <input
            type="checkbox"
            id="badges"
            checked={profileSettings.badges}
            onChange={toggleBadges}
          />
          <label htmlFor="badges">Show Badges</label>
        </div>
        <div>
          <input
            type="checkbox"
            id="achievements"
            checked={profileSettings.achievements}
            onChange={toggleAchievements}
          />
          <label htmlFor="achievements">Show Achievements</label>
        </div>
      </section>

      {/* Portfolio Tracking and Analytics */}
      <section>
        <h4>Portfolio Tracking and Analytics</h4>
        <p>
          Track the performance of your crypto portfolio with comprehensive
          analytics, including charts, graphs, and performance metrics. Analyze
          portfolio allocation and historical data to make informed trading
          decisions.
        </p>
      </section>

      {/* Social Interaction and Community Engagement */}
      <section>
        <h4>Social Interaction and Community Engagement</h4>
        <p>
          Engage with fellow enthusiasts, share trading insights, and
          participate in community-driven discussions or trading competitions.
          Follow other users, like and comment on their posts, and build
          connections within the crypto community.
        </p>
      </section>

      {/* Crypto News and Market Updates */}
      <section>
        <h4>Crypto News and Market Updates</h4>
        <p>
          Stay informed about the latest crypto news and market updates with
          real-time articles, market analysis, and expert insights tailored to
          your interests. Access personalized news recommendations and stay
          ahead in the ever-evolving crypto market.
        </p>
      </section>

      {/* Educational Resources and Learning Opportunities */}
      <section>
        <h4>Educational Resources and Learning Opportunities</h4>
        <p>
          Expand your knowledge and enhance your trading skills with access to
          educational resources such as articles, tutorials, webinars, and
          courses. Participate in interactive learning experiences and stay
          updated with the latest trading strategies and trends.
        </p>
      </section>

      {/* Events and Meetups */}
      <section>
        <h4>Events and Meetups</h4>
        <p>
          Attend crypto-related events, meetups, and conferences to network with
          industry professionals and fellow enthusiasts. Explore upcoming
          events, RSVP, and participate in virtual networking sessions or panel
          discussions to connect with like-minded individuals.
        </p>
      </section>

      {/* Gamification and Rewards */}
      <section>
        <h4>Gamification and Rewards</h4>
        <p>
          Earn badges, achievements, and rewards based on your activity level,
          trading performance, and contributions to the community. Unlock
          special rewards, discounts on trading fees, and exclusive access to
          premium features by achieving specific milestones within the platform.
        </p>
      </section>

      {/* Privacy and Security */}
      <section>
        <h4>Privacy and Security</h4>
        <p>
          Ensure the security of your account and personal information with
          robust security measures such as two-factor authentication,
          encryption, and regular security audits.
        </p>
        <div>
          <input
            type="checkbox"
            id="twoFactorAuth"
            checked={profileSettings.privacySettings.twoFactorAuth}
            onChange={toggleTwoFactorAuth}
          />
          <label htmlFor="twoFactorAuth">
            Enable Two-Factor Authentication
          </label>
        </div>
        <div>
          <input
            type="checkbox"
            id="encryption"
            checked={profileSettings.privacySettings.encryption}
            onChange={toggleEncryption}
          />
          <label htmlFor="encryption">Enable Encryption</label>
        </div>
      </section>

      {/* Add a button to signify completion of profile setup */}
      <button onClick={handleComplete}>Complete Profile Setup</button>
    </div>
  );
};

export default EnthusiastProfile;
