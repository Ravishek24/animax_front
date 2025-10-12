import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  FlatList,
  ActivityIndicator,
  Alert,
  Linking,
  Animated,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import { useLanguage } from '../contexts/LanguageContext';
import { SvgXml } from 'react-native-svg';

const PROFILE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="500" zoomAndPan="magnify" viewBox="0 0 375 374.999991" height="500" preserveAspectRatio="xMidYMid meet" version="1.0"><metadata><ContainsAiGeneratedContent>Yes</ContainsAiGeneratedContent></metadata><defs><clipPath id="47aedada52"><path d="M 37 37 L 339 37 L 339 339.289062 L 37 339.289062 Z M 37 37 " clip-rule="nonzero"/></clipPath><clipPath id="4811a6f502"><path d="M 74 59 L 307 59 L 307 339.289062 L 74 339.289062 Z M 74 59 " clip-rule="nonzero"/></clipPath></defs><rect x="-37.5" width="450" fill="#ffffff" y="-37.499999" height="449.999989" fill-opacity="1"/><rect x="-37.5" width="450" fill="#990906" y="-37.499999" height="449.999989" fill-opacity="1"/><g clip-path="url(#47aedada52)"><path fill="#f9ca1b" d="M 338.929688 184.523438 C 339.785156 216.652344 330.53125 246.699219 314.054688 271.621094 C 312.488281 273.996094 310.855469 276.324219 309.160156 278.597656 C 308.296875 279.753906 307.421875 280.894531 306.53125 282.019531 C 280.898438 314.445312 242.1875 336.167969 198.101562 339.054688 C 196.132812 339.183594 194.152344 339.277344 192.164062 339.328125 C 190.171875 339.382812 188.191406 339.394531 186.214844 339.371094 C 141.9375 338.835938 102.042969 319.121094 74.714844 287.980469 C 73.828125 286.976562 72.957031 285.953125 72.097656 284.921875 C 70.28125 282.738281 68.527344 280.503906 66.832031 278.214844 C 49.054688 254.207031 38.210938 224.695312 37.355469 192.5625 C 35.132812 109.285156 100.84375 39.972656 184.121094 37.753906 C 267.398438 35.53125 336.710938 101.242188 338.929688 184.523438 " fill-opacity="1" fill-rule="nonzero"/></g><g clip-path="url(#4811a6f502)"><path fill="#ffffff" d="M 306.53125 282.019531 C 280.898438 314.445312 242.1875 336.167969 198.101562 339.054688 C 196.132812 339.183594 194.152344 339.277344 192.164062 339.328125 C 190.171875 339.382812 188.191406 339.394531 186.214844 339.371094 C 141.9375 338.835938 102.042969 319.121094 74.714844 287.980469 C 85.027344 281.585938 100.777344 276.484375 110.496094 273.773438 C 121.515625 270.691406 139.429688 269.128906 149.1875 260.480469 L 151.304688 251.726562 L 155.460938 251.617188 C 157.554688 247.234375 159.195312 241.96875 158.605469 238.390625 C 157.683594 232.777344 152.644531 230.375 149.382812 226.203125 C 145.863281 221.707031 142.832031 216.738281 140.039062 211.765625 C 137.246094 206.808594 135.261719 201.648438 132.988281 196.445312 C 132.320312 194.917969 129.121094 199.636719 125.25 195.726562 C 115.417969 185.796875 114.785156 167.859375 114.34375 161.785156 C 113.625 151.902344 119.035156 155.808594 121.269531 157.035156 C 121.085938 152.386719 120.351562 116.03125 120.132812 107.960938 C 119.957031 101.335938 123.167969 79.007812 141.273438 84.164062 C 145.707031 85.425781 139.242188 71.726562 157.371094 69.796875 C 166.199219 68.863281 173.375 69.296875 187.003906 61.542969 C 192.414062 58.46875 207.617188 59.246094 213.34375 62.414062 C 229.3125 71.246094 224.832031 69.585938 234.144531 76.390625 C 243.824219 83.464844 236.4375 84.292969 245.527344 91.992188 C 253.777344 98.980469 249.507812 122.265625 249.996094 132.355469 C 250.050781 133.5625 250.652344 150.480469 250.855469 153.058594 C 253.253906 150.984375 257.683594 149.972656 257.472656 160.910156 C 257.316406 169.183594 255.441406 190.609375 246.550781 192.492188 C 242.535156 193.347656 243.515625 188.75 242.292969 193.023438 C 240.371094 199.746094 237.875 206.109375 234.878906 212.421875 C 231.214844 220.136719 226.4375 226.511719 221.796875 233.558594 C 218.304688 238.867188 221.109375 244.171875 222.648438 249.824219 L 226.765625 249.714844 L 229.292969 258.164062 C 240.988281 266.152344 264.054688 268.441406 273.148438 270.21875 C 284.191406 272.378906 296.003906 276.492188 306.53125 282.019531 " fill-opacity="1" fill-rule="nonzero"/></g></svg>`;

const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="500" zoomAndPan="magnify" viewBox="0 0 375 374.999991" height="500" preserveAspectRatio="xMidYMid meet" version="1.0"><metadata><ContainsAiGeneratedContent>Yes</ContainsAiGeneratedContent></metadata><defs><clipPath id="1498bb3985"><path d="M 60.523438 62 L 281 62 L 281 263 L 60.523438 263 Z M 60.523438 62 " clip-rule="nonzero"/></clipPath><clipPath id="b4ebcfff23"><path d="M 116 25.851562 L 156 25.851562 L 156 94 L 116 94 Z M 116 25.851562 " clip-rule="nonzero"/></clipPath></defs><rect x="-37.5" width="450" fill="#ffffff" y="-37.499999" height="449.999989" fill-opacity="1"/><rect x="-37.5" width="450" fill="#990906" y="-37.499999" height="449.999989" fill-opacity="1"/><g clip-path="url(#1498bb3985)"><path fill="#ffffff" d="M 279.03125 234.574219 C 271.886719 225.808594 262.671875 219.839844 252.664062 214.90625 C 244.980469 211.113281 237.28125 207.371094 229.703125 203.394531 C 226.878906 201.910156 224.378906 199.839844 221.714844 198.035156 C 221.511719 198.125 221.289062 198.210938 221.074219 198.300781 C 221.902344 203.882812 222.722656 209.472656 223.542969 215.027344 C 218.460938 208.390625 216.945312 200.621094 217.023438 192.085938 C 215.972656 192.621094 215.191406 192.96875 214.460938 193.402344 C 203.925781 199.660156 196.289062 208.464844 191.324219 219.644531 C 190.195312 222.199219 188.886719 224.679688 187.484375 227.574219 C 185.171875 223.019531 184.535156 218.929688 185.785156 214.511719 C 188.683594 204.175781 194.890625 196.308594 203.601562 190.269531 C 205.207031 189.15625 206.910156 188.195312 208.570312 187.15625 C 208.074219 186.96875 207.691406 187.011719 207.316406 187.101562 C 200.820312 188.605469 194.277344 189.671875 187.585938 189.234375 C 176.144531 188.476562 167 183.535156 160.582031 174.003906 C 153.863281 164.023438 152.882812 153.011719 155.503906 141.542969 C 156.082031 138.996094 157.089844 136.550781 157.90625 134.054688 C 158.484375 137.085938 158.355469 139.972656 158.515625 142.839844 C 158.691406 145.78125 158.976562 148.75 159.503906 151.636719 C 163.15625 171.625 178.8125 183.394531 198.988281 181.140625 C 205.40625 180.421875 211.753906 178.957031 218.140625 177.933594 C 222.285156 177.273438 226.28125 177.140625 230.261719 179.320312 C 233.222656 180.949219 236.632812 181.917969 239.949219 182.703125 C 245.988281 184.132812 251.921875 183.789062 257.164062 180.003906 C 258.40625 179.113281 259.25 177.671875 260.273438 176.484375 C 260.089844 176.152344 259.914062 175.828125 259.742188 175.503906 C 252.351562 175.878906 244.964844 176.257812 237.574219 176.648438 C 241.921875 175.355469 246.296875 174.1875 250.742188 173.429688 C 255.21875 172.664062 259.785156 171.921875 264.152344 174.191406 C 264.5625 174.40625 265.261719 174.253906 265.753906 174.074219 C 269.535156 172.695312 271.664062 170.007812 272.535156 166.050781 C 273.25 162.8125 274.121094 159.554688 275.414062 156.519531 C 277.523438 151.578125 276.519531 147.296875 271.96875 144.121094 C 268.996094 146.046875 265.675781 146.773438 262.164062 146.4375 C 258.589844 146.097656 255.027344 145.578125 251.453125 145.191406 C 244.378906 144.429688 239.554688 144.710938 237.230469 154.445312 C 237.097656 154.984375 236.976562 155.53125 236.917969 156.09375 C 236.644531 158.609375 236.398438 161.125 236.136719 163.644531 C 235.941406 163.667969 235.738281 163.691406 235.542969 163.726562 C 234.753906 160.90625 233.609375 158.132812 233.253906 155.261719 C 232.421875 148.554688 235.84375 140.234375 244.714844 139.53125 C 248.585938 139.226562 252.523438 139.734375 256.445312 139.898438 C 259.71875 140.039062 262.992188 140.207031 266.277344 140.359375 C 266.3125 140.128906 266.351562 139.898438 266.382812 139.675781 C 265.945312 139.394531 265.53125 139.078125 265.074219 138.824219 C 257.152344 134.558594 250.316406 128.96875 244.496094 122.113281 C 243.25 120.636719 242.675781 119.171875 242.882812 117.113281 C 243.097656 114.867188 242.847656 112.476562 242.347656 110.25 C 240.808594 103.511719 236.105469 99.089844 230.839844 95.109375 C 227.679688 92.71875 224.605469 90.214844 221.488281 87.757812 L 221.800781 87.28125 C 223.082031 87.910156 224.363281 88.53125 225.757812 89.207031 C 224.464844 75.519531 206.132812 62.058594 191.816406 66.058594 C 192.59375 68.101562 193.375 70.148438 194.160156 72.191406 C 193.632812 72.054688 193.382812 71.78125 193.203125 71.472656 C 189.347656 64.714844 182.292969 61.425781 174.503906 62.765625 C 167.5 63.972656 162.808594 68.855469 161.375 76.570312 C 159.839844 84.820312 159.046875 93.339844 151.546875 99.742188 C 153.632812 99.324219 155.007812 99.046875 156.378906 98.773438 C 156.234375 99.316406 156.015625 99.546875 155.75 99.6875 C 151.332031 102.039062 146.851562 102.429688 142.132812 100.464844 C 132.773438 96.558594 123.371094 96.3125 113.871094 100.210938 C 111.613281 101.140625 111.007812 102.339844 111.53125 104.523438 C 113.648438 113.394531 119.054688 119.5 127.445312 122.730469 C 135.863281 125.96875 144.015625 124.464844 151.621094 119.957031 C 154.597656 118.1875 157.269531 115.925781 160.019531 113.933594 C 155.679688 125.761719 145.746094 132.625 132.773438 132.496094 C 130.761719 132.476562 129.539062 133 128.558594 134.753906 C 127.261719 137.050781 125.699219 139.191406 124.277344 141.417969 C 115.476562 155.144531 107.503906 169.273438 103.007812 185.097656 C 99.746094 196.605469 99.53125 208.058594 103.992188 219.269531 C 108.566406 230.769531 116.472656 239.679688 126.375 246.9375 C 126.882812 247.304688 127.367188 247.726562 128.246094 248.425781 C 118.257812 246.082031 108.929688 241.199219 101.855469 234.316406 C 86.089844 218.976562 79.457031 199.46875 76.773438 178.269531 C 75.402344 167.457031 76.257812 156.679688 78.144531 145.980469 C 81.441406 127.277344 88.601562 110.257812 100.574219 95.453125 C 104.675781 90.394531 109.371094 85.816406 113.667969 81.152344 C 113.878906 81.1875 113.6875 81.085938 113.589844 81.148438 C 112.972656 81.511719 112.382812 81.898438 111.78125 82.304688 C 100.671875 89.710938 91.226562 98.796875 83.441406 109.695312 C 69.40625 129.347656 61.941406 151.25 60.90625 175.285156 C 60.476562 185.304688 61.394531 195.285156 63.769531 205.085938 C 67.234375 219.425781 72.792969 232.804688 82.070312 244.421875 C 91.671875 256.425781 104.148438 262.609375 119.621094 262.351562 C 126.664062 262.238281 133.53125 260.917969 139.964844 258.15625 C 152.164062 252.886719 164.191406 247.226562 176.320312 241.792969 C 198.425781 231.894531 221.238281 225.320312 245.832031 227.246094 C 257.285156 228.144531 268.257812 230.722656 278.433594 236.222656 C 279.246094 236.667969 280.050781 237.117188 280.855469 237.570312 C 280.402344 236.320312 279.726562 235.4375 279.03125 234.574219 Z M 129.546875 193.265625 C 127.128906 203.402344 126 213.695312 125.660156 224.699219 C 119.367188 202.023438 124 181.800781 136.851562 162.648438 C 134.355469 173.121094 131.957031 183.199219 129.546875 193.265625 Z M 129.546875 193.265625 " fill-opacity="1" fill-rule="evenodd"/></g><path fill="#f9ca1b" d="M 309.660156 206.113281 C 307.691406 214.476562 304.871094 222.722656 301.335938 230.828125 C 301.347656 230.199219 301.359375 229.566406 301.378906 228.933594 C 303.25 218.605469 304.230469 207.941406 304.230469 197.035156 C 304.230469 184.195312 302.871094 171.691406 300.296875 159.683594 C 297.84375 139.824219 290.53125 121.632812 279.726562 104.832031 L 273.355469 97.476562 L 261.195312 82.105469 C 268.007812 86.238281 275.113281 91.929688 281.820312 99.152344 C 293.019531 111.210938 303.089844 127.523438 308.769531 147.898438 C 314.3125 167.808594 314.121094 187.269531 309.660156 206.113281 Z M 309.660156 206.113281 " fill-opacity="1" fill-rule="evenodd"/><g clip-path="url(#b4ebcfff23)"><path fill="#ffffff" d="M 121.699219 47.726562 C 120.722656 54.085938 120.035156 60.503906 121.828125 66.773438 C 125.605469 80 134.316406 88.566406 147.292969 93.003906 C 149.558594 93.78125 150.710938 93.097656 151.683594 91.21875 C 154.691406 85.394531 155.371094 79.101562 155.707031 72.65625 C 154.484375 72.335938 153.492188 72.082031 152.5 71.820312 C 142.859375 69.238281 136.921875 63.03125 134.671875 53.378906 C 134.003906 50.515625 133.757812 47.539062 133.511719 44.59375 C 132.753906 35.539062 125.886719 27.757812 116.609375 25.84375 C 120.085938 29.417969 122.640625 33.3125 122.628906 38.226562 C 122.605469 41.390625 122.175781 44.578125 121.699219 47.726562 Z M 121.699219 47.726562 " fill-opacity="1" fill-rule="evenodd"/></g><path fill="#ffffff" d="M 255.683594 50.085938 C 256.703125 56.351562 256.128906 61.960938 254.175781 66.980469 C 253.703125 68.199219 253.148438 69.386719 252.511719 70.542969 L 252.511719 70.546875 C 252.207031 71.097656 251.890625 71.632812 251.550781 72.167969 C 250.695312 73.515625 249.722656 74.824219 248.652344 76.082031 C 246.71875 78.34375 244.433594 80.457031 241.847656 82.417969 C 238.765625 84.757812 235.128906 86.363281 231.367188 88.523438 C 230.464844 81.890625 227.726562 76.863281 223.285156 72.441406 C 229.066406 71.632812 234.40625 70.246094 238.816406 66.511719 C 239.710938 65.742188 240.539062 64.941406 241.28125 64.09375 C 241.429688 63.929688 241.566406 63.773438 241.714844 63.605469 C 244.859375 59.851562 246.566406 55.367188 247.027344 50.257812 C 247.425781 45.6875 247.953125 41.160156 251.171875 37.511719 C 253.488281 34.871094 256.425781 33.46875 259.984375 32.984375 C 253.355469 37.460938 254.660156 43.796875 255.683594 50.085938 Z M 255.683594 50.085938 " fill-opacity="1" fill-rule="evenodd"/><path fill="#ffffff" d="M 256.449219 107.140625 C 258.027344 104.601562 258.324219 101.914062 257.945312 99.097656 C 257.863281 98.488281 257.179688 97.597656 256.628906 97.476562 C 251.25 96.304688 245.847656 96.007812 240.152344 97.757812 C 245.140625 102.503906 248.328125 107.828125 247.667969 115.027344 C 251.378906 112.976562 254.3125 110.578125 256.449219 107.140625 Z M 256.449219 107.140625 " fill-opacity="1" fill-rule="evenodd"/><path fill="#f9ca1b" d="M 277.976562 269.378906 C 272.800781 269.835938 267.578125 270.007812 262.457031 270.816406 C 252.390625 272.402344 242.972656 276.09375 234.195312 281.140625 C 224.539062 286.675781 215.234375 292.808594 205.667969 298.511719 C 193.382812 305.835938 180.144531 309.878906 165.703125 309.527344 C 153.757812 309.242188 142.640625 306.125 132.363281 300.039062 C 131.964844 299.796875 131.59375 299.53125 130.789062 298.992188 C 152.308594 301.886719 171.671875 296.683594 190.179688 287.113281 C 201.84375 281.074219 213.710938 275.445312 226.371094 271.734375 C 238.8125 268.097656 251.480469 265.878906 264.488281 266.824219 C 269.046875 267.160156 273.550781 268.296875 277.976562 269.378906 Z M 277.976562 269.378906 " fill-opacity="1" fill-rule="evenodd"/><path fill="#f9ca1b" d="M 301.726562 276.375 C 296.859375 270.40625 291.03125 265.707031 284.078125 262.386719 C 276.519531 258.765625 268.53125 257.070312 260.230469 256.53125 C 239.746094 255.183594 220.582031 260.417969 202.011719 268.339844 C 191.484375 272.828125 181.226562 277.941406 170.6875 282.40625 C 157.140625 288.144531 142.9375 290.824219 128.226562 289.246094 C 113.191406 287.632812 100.824219 280.960938 92.160156 268.996094 C 97.003906 270.714844 102.109375 273.109375 107.484375 274.304688 C 118.921875 276.847656 130.378906 275.691406 141.230469 271.566406 C 151.613281 267.628906 161.695312 262.875 171.765625 258.191406 C 187.011719 251.097656 202.300781 244.117188 218.953125 240.964844 C 237.941406 237.382812 256.710938 237.273438 274.679688 245.621094 C 288.148438 251.878906 296.960938 262.382812 301.726562 276.375 Z M 301.726562 276.375 " fill-opacity="1" fill-rule="evenodd"/><path fill="#f9ca1b" d="M 310.015625 194.75 C 310.015625 198.570312 309.894531 202.363281 309.660156 206.113281 C 307.691406 214.476562 304.871094 222.722656 301.335938 230.828125 C 301.347656 230.199219 301.359375 229.566406 301.378906 228.933594 C 303.25 218.605469 304.230469 207.941406 304.230469 197.035156 C 304.230469 184.195312 302.871094 171.691406 300.296875 159.683594 C 295.390625 136.785156 286.078125 115.695312 273.355469 97.476562 L 261.195312 82.105469 C 268.007812 86.238281 275.113281 91.929688 281.820312 99.152344 C 299.585938 126.199219 310.015625 159.171875 310.015625 194.75 Z M 310.015625 194.75 " fill-opacity="1" fill-rule="evenodd"/></svg>`;

interface Animal {
  id: string;
  title: string;
  price: number;
  breed: string;
  milkCapacity: string;
  currentMilk: string;
  pregnant: boolean;
  pregnancyMonths?: number;
  age: string;
  location: string;
  distance: string;
  postedTime: string;
  sellerName: string;
  sellerPhone: string;
  missedCalls: number;
  isPremium: boolean;
  category: 'cow' | 'buffalo' | 'other';
  videos: string[];
  additionalInfo: string[];
  description?: string;
}

interface Category {
  id: string;
  name: string;
  emoji: string;
  key: 'all' | 'cow' | 'buffalo' | 'other';
}

const BuyAnimalsScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'cow' | 'buffalo' | 'other'>('all');
  const [nearbyOnly, setNearbyOnly] = useState(true);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const categories: Category[] = [
    { id: '1', name: t('categoryAll'), emoji: '🐄', key: 'all' },
    { id: '2', name: t('categoryCow'), emoji: '🐄', key: 'cow' },
    { id: '3', name: t('categoryBuffalo'), emoji: '🐃', key: 'buffalo' },
    { id: '4', name: t('categoryOther'), emoji: '🐮', key: 'other' },
  ];

  // Sample data - Replace with API call
  const sampleAnimals: Animal[] = [
    {
      id: '1',
      title: '18L दूध क्षमता | मुर्रा | ब्यावी नहीं | OL अभी का दूध',
      price: 122000,
      breed: 'मुर्रा भैंस',
      milkCapacity: '18L',
      currentMilk: '16L',
      pregnant: true,
      pregnancyMonths: 8,
      age: '4 वर्ष',
      location: 'Gurugram',
      distance: '61 कि.मी.',
      postedTime: '2 दिन पहले',
      sellerName: 'Manav जी',
      sellerPhone: '+91-9876543210',
      missedCalls: 10,
      isPremium: true,
      category: 'buffalo',
      videos: ['video1.mp4', 'video2.mp4'],
      additionalInfo: [
        '8 महीने की गर्भवती है',
        '2nd timer jhoti h bhot sharif h first timer ne 16kg doodh diya tha 7.5month ki ghaban h'
      ],
    },
    {
      id: '2',
      title: 'साहीवाल गाय | 15L दूध | प्रथम ब्यांत | स्वस्थ',
      price: 95000,
      breed: 'साहीवाल',
      milkCapacity: '15L',
      currentMilk: '15L',
      pregnant: false,
      age: '3 वर्ष',
      location: 'Delhi',
      distance: '25 कि.मी.',
      postedTime: '1 दिन पहले',
      sellerName: 'Suresh जी',
      sellerPhone: '+91-9876543211',
      missedCalls: 5,
      isPremium: false,
      category: 'cow',
      videos: ['video3.mp4', 'video4.mp4'],
      additionalInfo: [
        'पूर्ण स्वस्थ, टीकाकरण पूर्ण',
        'आयु: 3 वर्ष',
        'वर्तमान दूध: 15 लीटर प्रति दिन'
      ],
    },
    {
      id: '3',
      title: 'नीली रावी भैंस | 20L दूध | द्वितीय ब्यांत',
      price: 145000,
      breed: 'नीली रावी',
      milkCapacity: '20L',
      currentMilk: '18L',
      pregnant: true,
      pregnancyMonths: 5,
      age: '5 वर्ष',
      location: 'Faridabad',
      distance: '45 कि.मी.',
      postedTime: '3 दिन पहले',
      sellerName: 'Rajesh जी',
      sellerPhone: '+91-9876543212',
      missedCalls: 15,
      isPremium: true,
      category: 'buffalo',
      videos: ['video5.mp4', 'video6.mp4'],
      additionalInfo: [
        '5 महीने की गर्भवती है',
        'उच्च गुणवत्ता नीली रावी नस्ल',
        'पहली बार 18L दूध दिया था'
      ],
    },
  ];

  const loadAnimals = async (category?: string, nearby?: boolean) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let filteredAnimals = sampleAnimals;
      
      // Filter by category
      if (category && category !== 'all') {
        filteredAnimals = filteredAnimals.filter(animal => animal.category === category);
      }
      
      // Filter by nearby (you'd implement actual location-based filtering)
      if (nearby) {
        filteredAnimals = filteredAnimals.filter(animal => 
          parseInt(animal.distance) <= 50
        );
      }
      
      setAnimals(filteredAnimals);
    } catch (error) {
      console.error('Error loading animals:', error);
      Alert.alert(t('errorTitle'), t('errorLoadAnimals'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnimals();
    
    // Animate on load
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleCategorySelect = (category: 'all' | 'cow' | 'buffalo' | 'other') => {
    setSelectedCategory(category);
    loadAnimals(category, nearbyOnly);
  };

  const toggleNearby = () => {
    const newNearby = !nearbyOnly;
    setNearbyOnly(newNearby);
    loadAnimals(selectedCategory, newNearby);
  };

  const handleCall = (phone: string, sellerName: string) => {
    Alert.alert(
      t('callTitle'),
      t('callPrompt').replace('{name}', sellerName),
      [
        { text: t('cancel'), style: 'cancel' },
        { 
          text: t('callAction'), 
          onPress: () => Linking.openURL(`tel:${phone}`)
        }
      ]
    );
  };

  const handleWhatsApp = (phone: string, animalTitle: string) => {
    const message = `नमस्ते, मुझे इस पशु में रुचि है: ${animalTitle}`;
    const url = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert(t('errorTitle'), 'WhatsApp खोलने में समस्या हुई है।');
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnimals(selectedCategory, nearbyOnly);
    setRefreshing(false);
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item.key && styles.categoryItemActive
      ]}
      onPress={() => handleCategorySelect(item.key)}
    >
      <Text style={styles.categoryEmoji}>{item.emoji}</Text>
      <Text style={[
        styles.categoryText,
        selectedCategory === item.key && styles.categoryTextActive
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderAnimal = ({ item, index }: { item: Animal, index: number }) => (
    <Animated.View 
      style={[
        styles.animalCard,
        { 
          opacity: fadeAnim,
          transform: [{
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            }),
          }],
        }
      ]}
    >
      {/* Animal Header */}
      <View style={styles.animalHeader}>
        <Text style={styles.animalTitle}>{item.title}</Text>
        <Text style={styles.animalPrice}>₹{item.price.toLocaleString('hi-IN')}</Text>
        <View style={styles.postingDetails}>
          <View style={styles.postingTime}>
            <Icon name="clock-outline" size={14} color="#666" />
            <Text style={styles.postingText}>{item.postedTime}</Text>
          </View>
          <View style={styles.postingLocation}>
            <Icon name="map-marker" size={14} color="#666" />
            <Text style={styles.postingText}>{item.location} ({t('approxWord')} {item.distance})</Text>
          </View>
        </View>
      </View>

      {/* Media Section */}
      <View style={styles.mediaSection}>
        <View style={styles.videoThumbnail}>
          <TouchableOpacity style={styles.playButton}>
            <Icon name="play" size={24} color="#ff3b3b" />
          </TouchableOpacity>
        </View>
        <View style={styles.videoThumbnail}>
          <TouchableOpacity style={styles.playButton}>
            <Icon name="play" size={24} color="#ff3b3b" />
          </TouchableOpacity>
        </View>
        {item.isPremium && (
          <View style={styles.premiumBadge}>
            <Icon name="crown" size={12} color="#333" />
            <Text style={styles.premiumText}>{t('premiumAnimal')}</Text>
          </View>
        )}
      </View>

      {/* Additional Info */}
      <View style={styles.additionalInfo}>
        {item.pregnant && (
          <View style={styles.pregnancyInfo}>
            <Text style={styles.pregnancyText}>
              👆 {item.pregnancyMonths} महीने की गर्भवती है।
            </Text>
          </View>
        )}
        {item.additionalInfo.map((info, index) => (
          <View key={index} style={styles.infoItem}>
            <Icon name="information" size={16} color="#ff3b3b" />
            <Text style={styles.infoText}>{info}</Text>
          </View>
        ))}
      </View>

      {/* Seller Section */}
      <View style={styles.sellerSection}>
        <View style={styles.sellerInfo}>
          <View style={styles.sellerAvatar}>
            <Text style={styles.sellerInitial}>
              {item.sellerName.charAt(0)}
            </Text>
          </View>
          <View style={styles.sellerDetails}>
            <Text style={styles.sellerName}>{item.sellerName}</Text>
            <View style={styles.missedCalls}>
              <Icon name="phone" size={12} color="#666" />
              <Text style={styles.missedCallsText}>{item.missedCalls} आहक कॉल</Text>
            </View>
          </View>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.callButton}
            onPress={() => handleCall(item.sellerPhone, item.sellerName)}
          >
            <Icon name="phone" size={16} color="white" />
            <Text style={styles.callButtonText}>कॉल</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.whatsappButton}
            onPress={() => handleWhatsApp(item.sellerPhone, item.title)}
          >
            <Icon name="whatsapp" size={16} color="white" />
            <Text style={styles.whatsappButtonText}>WhatsApp</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaWrapper
      backgroundColor="#ffffff"
      topBackgroundColor="#E8E8E8"
      bottomBackgroundColor="#000000"
    >
      <StatusBar backgroundColor="#E8E8E8" barStyle="dark-content" translucent={false} />
      
      {/* Header - Same as Home Screen */}
      <View style={styles.header}>
        <View style={styles.logo}>
          <SvgXml 
            width={40} 
            height={40} 
            xml={LOGO_SVG} 
          />
          <Text style={styles.logoText}>{t('appName')}</Text>
        </View>
        <TouchableOpacity 
          style={styles.userProfile}
          onPress={() => router.push('/profile')}
        >
          <SvgXml 
            width={28} 
            height={28} 
            xml={PROFILE_SVG} 
          />
          <Text style={styles.profileText}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Location Section */}
      <View style={styles.locationSection}>
        <View style={styles.locationHeader}>
          <View style={styles.locationInfo}>
            <Icon name="map-marker" size={18} color="#ff3b3b" />
            <Text style={styles.locationText}>Block C, Ansal Golf Links 1,...</Text>
          </View>
          <View style={styles.nearbyToggle}>
            <Text style={styles.nearbyText}>{t('nearbyAnimals')}</Text>
            <TouchableOpacity
              style={[styles.toggleSwitch, nearbyOnly && styles.toggleSwitchActive]}
              onPress={toggleNearby}
            >
              <View style={[styles.toggleThumb, nearbyOnly && styles.toggleThumbActive]} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Category Navigation */}
      <View style={styles.categoryNav}>
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContainer}
        />
      </View>

      {/* Main Content */}
      <FlatList
        data={animals}
        renderItem={renderAnimal}
        keyExtractor={(item) => item.id}
        style={styles.animalsList}
        contentContainerStyle={styles.animalsListContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#ff3b3b" />
              <Text style={styles.loadingText}>{t('loadingAnimals')}</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="cow" size={64} color="#ccc" />
              <Text style={styles.emptyText}>{t('noAnimals')}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => loadAnimals()}>
                <Text style={styles.retryButtonText}>{t('retry')}</Text>
              </TouchableOpacity>
            </View>
          )
        }
        ListFooterComponent={
          loading && animals.length > 0 ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator size="small" color="#ff3b3b" />
              <Text style={styles.footerLoadingText}>{t('loadingMoreAnimals')}</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  // Header - Same as Home Screen
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ff3b3b',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: '#3a3a3a',
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    marginRight: 10,
  },
  logoText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 1,
  },
  userProfile: {
    alignItems: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f9ca1b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  profileInitial: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileText: {
    color: 'white',
    fontSize: 14,
  },

  // Location Section
  locationSection: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginLeft: 8,
  },
  nearbyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nearbyText: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    backgroundColor: '#ccc',
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
  },
  toggleSwitchActive: {
    backgroundColor: '#ff3b3b',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },

  // Category Navigation
  categoryNav: {
    backgroundColor: 'white',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  categoryContainer: {
    paddingHorizontal: 16,
  },
  categoryItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 80,
  },
  categoryItemActive: {
    backgroundColor: '#fff8f8',
    borderColor: '#ff3b3b',
  },
  categoryEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  categoryTextActive: {
    color: '#ff3b3b',
  },

  // Animals List
  animalsList: {
    flex: 1,
  },
  animalsListContent: {
    padding: 16,
    paddingBottom: 80,
  },

  // Animal Card
  animalCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#ff3b3b',
  },

  // Animal Header
  animalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  animalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  animalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff3b3b',
    marginBottom: 8,
  },
  postingDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  postingTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postingLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  postingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },

  // Media Section
  mediaSection: {
    height: 200,
    flexDirection: 'row',
    position: 'relative',
  },
  videoThumbnail: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 2,
    borderRightColor: 'white',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  premiumBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#f9ca1b',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  premiumText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 4,
  },

  // Additional Info
  additionalInfo: {
    padding: 16,
    backgroundColor: '#fff8f8',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  pregnancyInfo: {
    marginBottom: 8,
  },
  pregnancyText: {
    backgroundColor: '#4caf50',
    color: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },

  // Seller Section
  sellerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sellerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ff3b3b',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sellerInitial: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sellerDetails: {
    flex: 1,
  },
  sellerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  missedCalls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  missedCallsText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  callButton: {
    backgroundColor: '#2196f3',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  callButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  whatsappButton: {
    backgroundColor: '#25d366',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  whatsappButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },

  // Loading & Empty States
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#ff3b3b',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  footerLoading: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerLoadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
});

export default BuyAnimalsScreen;