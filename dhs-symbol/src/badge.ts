/**
 * Copyright (c) Dignitas Technologies, LLC
 *
 * This file and its contents are governed by one or more distribution and
 * copyright statements as described in the LICENSE.txt file distributed with
 * this work.
 */

/**
 * Icon Badge Options
 */
export interface BadgeOptions {
  badgeCount: number; // Number to display within badge
  badgeRadius: number; // Radius of badge frame
  badgeFontSize: number; // Size of number to display within badge
  badgeTextColor: string; // Color of Badge Text. Locally defined colors are checked first. If not present, then assume CSS Color syntax. ex. "red" or "#00FF00" or "rgb(0,0,255)"
  badgeFillColor: string; // Fill Color of Badge. Locally defined colors are checked first. If not present, then assume CSS Color syntax. ex. "red" or "#00FF00" or "rgb(0,0,255)"
  badgeBaselineAdjust: number; // Baseline adjustment for badge text, a percentage of the radius (0-1), positive value moves the text down, default is 0.5
}

/**
 * Icon Badge Validation constant
 */
export const badgeValidation: Required<BadgeOptions> = {
  badgeCount: 0,
  badgeRadius: 0,
  badgeFontSize: 0,
  badgeTextColor: '',
  badgeFillColor: '',
  badgeBaselineAdjust: 0
};

/**
 * Icon Badge Defaults constant
 */
export const badgeDefaults: BadgeOptions = {
  badgeCount: 0,
  badgeRadius: 15,
  badgeFontSize: 24,
  badgeTextColor: '#000000', // black
  badgeFillColor: '#FFFFFF', // white
  badgeBaselineAdjust: 0.5
};
