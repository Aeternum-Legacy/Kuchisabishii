/**
 * WCAG 2.1 AA Compliance Tests for Kuchisabishii
 * Tests accessibility compliance with focus on emotional rating system
 */

import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { JSDOM } from 'jsdom';
import axe from 'axe-core';

// Mock DOM environment for testing
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window as any;
global.document = dom.window.document;

describe('WCAG 2.1 AA Compliance', () => {
  let container: HTMLElement;

  beforeAll(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterAll(() => {
    document.body.removeChild(container);
  });

  describe('Emotional Rating System Accessibility', () => {
    test('emotional rating inputs should be properly labeled', async () => {
      container.innerHTML = `
        <div class="emotional-rating-form">
          <fieldset>
            <legend>Rate Your Emotional Experience</legend>
            
            <div class="rating-dimension">
              <label for="satisfaction">
                Satisfaction Level
                <span class="help-text">How satisfied did this meal make you feel?</span>
              </label>
              <input 
                type="range" 
                id="satisfaction" 
                min="1" 
                max="10" 
                value="5"
                aria-describedby="satisfaction-help"
                aria-label="Satisfaction level from 1 to 10"
              />
              <div id="satisfaction-help" class="sr-only">
                Use arrow keys to adjust satisfaction level between 1 (very unsatisfied) and 10 (completely satisfied)
              </div>
            </div>

            <div class="rating-dimension">
              <label for="comfort">
                Comfort Level
                <span class="help-text">How much comfort did this food provide?</span>
              </label>
              <input 
                type="range" 
                id="comfort" 
                min="1" 
                max="10" 
                value="5"
                aria-describedby="comfort-help"
                aria-label="Comfort level from 1 to 10"
              />
              <div id="comfort-help" class="sr-only">
                Rate how comforting this food was, from 1 (no comfort) to 10 (ultimate comfort)
              </div>
            </div>

            <div class="primary-rating">
              <fieldset>
                <legend>Overall Emotional Rating</legend>
                <input type="radio" id="never-again" name="primary-rating" value="1" />
                <label for="never-again">Never again - this didn't speak to my soul</label>

                <input type="radio" id="disappointed" name="primary-rating" value="2" />
                <label for="disappointed">Disappointed - left my mouth wanting</label>

                <input type="radio" id="neutral" name="primary-rating" value="3" />
                <label for="neutral">Neutral - filled the space but didn't fill the longing</label>

                <input type="radio" id="satisfied" name="primary-rating" value="4" />
                <label for="satisfied">Satisfied - hit the spot nicely</label>

                <input type="radio" id="mouth-lonely" name="primary-rating" value="5" />
                <label for="mouth-lonely">When my mouth is lonely - I'll dream of this</label>
              </fieldset>
            </div>
          </fieldset>
        </div>
      `;

      const results = await axe.run(container);
      expect(results.violations).toHaveLength(0);
      
      // Verify specific accessibility requirements
      const satisfactionInput = container.querySelector('#satisfaction') as HTMLInputElement;
      expect(satisfactionInput.getAttribute('aria-label')).toBeTruthy();
      expect(satisfactionInput.getAttribute('aria-describedby')).toBe('satisfaction-help');

      const radioButtons = container.querySelectorAll('input[type="radio"]');
      radioButtons.forEach(radio => {
        const label = container.querySelector(`label[for="${radio.id}"]`);
        expect(label).toBeTruthy();
      });
    });

    test('emotional context form should be screen reader accessible', async () => {
      container.innerHTML = `
        <form class="emotional-context-form">
          <div class="form-section">
            <label for="mood-before">How did you feel before eating?</label>
            <select id="mood-before" aria-describedby="mood-before-help">
              <option value="">Select your mood</option>
              <option value="happy">Happy</option>
              <option value="sad">Sad</option>
              <option value="lonely">Lonely</option>
              <option value="stressed">Stressed</option>
            </select>
            <div id="mood-before-help" class="help-text">
              Your emotional state before this meal helps us understand its impact
            </div>
          </div>

          <div class="form-section">
            <label for="social-setting">Who were you with?</label>
            <select id="social-setting" aria-describedby="social-help">
              <option value="">Select setting</option>
              <option value="alone">Eating alone</option>
              <option value="with_friends">With friends</option>
              <option value="with_family">With family</option>
              <option value="on_date">On a date</option>
            </select>
            <div id="social-help" class="help-text">
              Social context affects how we experience food emotionally
            </div>
          </div>

          <div class="form-section">
            <label for="emotional-notes">Additional thoughts (optional)</label>
            <textarea 
              id="emotional-notes" 
              aria-describedby="notes-help"
              placeholder="Describe what this meal meant to you..."
              rows="4"
            ></textarea>
            <div id="notes-help" class="help-text">
              Share any memories, feelings, or thoughts this meal evoked
            </div>
          </div>
        </form>
      `;

      const results = await axe.run(container);
      expect(results.violations).toHaveLength(0);

      // Verify form accessibility
      const selectElements = container.querySelectorAll('select');
      selectElements.forEach(select => {
        const label = container.querySelector(`label[for="${select.id}"]`);
        expect(label).toBeTruthy();
        expect(select.getAttribute('aria-describedby')).toBeTruthy();
      });
    });

    test('mouth loneliness visualization should be accessible', async () => {
      container.innerHTML = `
        <div class="mouth-loneliness-display" role="region" aria-labelledby="loneliness-title">
          <h3 id="loneliness-title">Your Mouth Loneliness Level</h3>
          
          <div class="loneliness-meter" role="meter" 
               aria-valuenow="8" 
               aria-valuemin="1" 
               aria-valuemax="10"
               aria-labelledby="loneliness-title"
               aria-describedby="loneliness-description">
            <div class="meter-fill" style="width: 80%"></div>
          </div>
          
          <div id="loneliness-description" class="meter-description">
            Your mouth loneliness level is 8 out of 10. This indicates a strong emotional connection to comfort food when eating alone.
          </div>

          <div class="loneliness-insights" aria-labelledby="insights-title">
            <h4 id="insights-title">When You Might Crave This</h4>
            <ul>
              <li>When feeling lonely or isolated</li>
              <li>During stressful periods</li>
              <li>When seeking emotional comfort</li>
            </ul>
          </div>
        </div>
      `;

      const results = await axe.run(container);
      expect(results.violations).toHaveLength(0);

      // Verify meter element accessibility
      const meter = container.querySelector('[role="meter"]');
      expect(meter?.getAttribute('aria-valuenow')).toBe('8');
      expect(meter?.getAttribute('aria-valuemin')).toBe('1');
      expect(meter?.getAttribute('aria-valuemax')).toBe('10');
      expect(meter?.getAttribute('aria-describedby')).toBe('loneliness-description');
    });
  });

  describe('Color Contrast and Visual Accessibility', () => {
    test('emotional rating colors should meet WCAG contrast ratios', async () => {
      container.innerHTML = `
        <style>
          .rating-never-again { background-color: #dc3545; color: #ffffff; } /* Red */
          .rating-disappointed { background-color: #fd7e14; color: #000000; } /* Orange */
          .rating-neutral { background-color: #6c757d; color: #ffffff; } /* Gray */
          .rating-satisfied { background-color: #28a745; color: #ffffff; } /* Green */
          .rating-mouth-lonely { background-color: #6f42c1; color: #ffffff; } /* Purple */
          
          .comfort-low { background-color: #e9ecef; color: #495057; }
          .comfort-medium { background-color: #ffc107; color: #212529; }
          .comfort-high { background-color: #dc3545; color: #ffffff; }
        </style>
        
        <div class="emotional-rating-display">
          <div class="rating-never-again">Never again - this didn't speak to my soul</div>
          <div class="rating-disappointed">Disappointed - left my mouth wanting</div>
          <div class="rating-neutral">Neutral - filled the space but didn't fill the longing</div>
          <div class="rating-satisfied">Satisfied - hit the spot nicely</div>
          <div class="rating-mouth-lonely">When my mouth is lonely - I'll dream of this</div>
        </div>
      `;

      const results = await axe.run(container, {
        rules: {
          'color-contrast': { enabled: true },
          'color-contrast-enhanced': { enabled: true }
        }
      });

      const contrastViolations = results.violations.filter(v => 
        v.id === 'color-contrast' || v.id === 'color-contrast-enhanced'
      );
      expect(contrastViolations).toHaveLength(0);
    });

    test('interactive elements should have sufficient touch targets', async () => {
      container.innerHTML = `
        <div class="mobile-rating-interface">
          <button class="rating-button" style="min-height: 44px; min-width: 44px; padding: 12px;">
            Rate this dish
          </button>
          
          <div class="rating-stars">
            <button class="star-button" style="min-height: 44px; min-width: 44px;" aria-label="1 star">⭐</button>
            <button class="star-button" style="min-height: 44px; min-width: 44px;" aria-label="2 stars">⭐</button>
            <button class="star-button" style="min-height: 44px; min-width: 44px;" aria-label="3 stars">⭐</button>
            <button class="star-button" style="min-height: 44px; min-width: 44px;" aria-label="4 stars">⭐</button>
            <button class="star-button" style="min-height: 44px; min-width: 44px;" aria-label="5 stars">⭐</button>
          </div>
        </div>
      `;

      const results = await axe.run(container);
      expect(results.violations).toHaveLength(0);

      // Verify touch target sizes
      const buttons = container.querySelectorAll('button');
      buttons.forEach(button => {
        const computedStyle = window.getComputedStyle(button);
        const height = parseInt(computedStyle.minHeight);
        const width = parseInt(computedStyle.minWidth);
        
        expect(height).toBeGreaterThanOrEqual(44); // WCAG 2.1 AA minimum
        expect(width).toBeGreaterThanOrEqual(44);
      });
    });
  });

  describe('Keyboard Navigation', () => {
    test('emotional rating form should support keyboard navigation', async () => {
      container.innerHTML = `
        <form class="keyboard-accessible-form">
          <div class="rating-dimensions">
            <input type="range" id="satisfaction" tabindex="0" />
            <input type="range" id="comfort" tabindex="0" />
            <input type="range" id="excitement" tabindex="0" />
          </div>
          
          <div class="context-selects">
            <select id="mood-before" tabindex="0">
              <option value="happy">Happy</option>
              <option value="sad">Sad</option>
            </select>
            
            <select id="social-setting" tabindex="0">
              <option value="alone">Alone</option>
              <option value="with_friends">With friends</option>
            </select>
          </div>
          
          <button type="submit" tabindex="0">Save Rating</button>
        </form>
      `;

      const results = await axe.run(container, {
        rules: {
          'tabindex': { enabled: true },
          'focus-order-semantics': { enabled: true }
        }
      });

      expect(results.violations).toHaveLength(0);

      // Verify all interactive elements have proper tabindex
      const interactiveElements = container.querySelectorAll('input, select, button');
      interactiveElements.forEach(element => {
        expect(element.getAttribute('tabindex')).toBe('0');
      });
    });

    test('skip navigation should be available', async () => {
      container.innerHTML = `
        <div class="app-layout">
          <a href="#main-content" class="skip-nav">Skip to main content</a>
          <a href="#emotional-rating" class="skip-nav">Skip to emotional rating</a>
          
          <nav aria-label="Main navigation">
            <ul>
              <li><a href="/dashboard">Dashboard</a></li>
              <li><a href="/food-log">Food Log</a></li>
              <li><a href="/recommendations">Recommendations</a></li>
            </ul>
          </nav>
          
          <main id="main-content">
            <section id="emotional-rating" tabindex="-1">
              <h2>Rate Your Emotional Experience</h2>
              <!-- Rating form would go here -->
            </section>
          </main>
        </div>
      `;

      const results = await axe.run(container);
      expect(results.violations).toHaveLength(0);

      // Verify skip links exist
      const skipLinks = container.querySelectorAll('.skip-nav');
      expect(skipLinks.length).toBeGreaterThan(0);

      // Verify main content is reachable
      const mainContent = container.querySelector('#main-content');
      expect(mainContent).toBeTruthy();
    });
  });

  describe('Screen Reader Support', () => {
    test('emotional insights should be announced properly', async () => {
      container.innerHTML = `
        <div class="emotional-insights" role="region" aria-live="polite">
          <h3 id="insights-heading">Your Emotional Food Journey</h3>
          
          <div class="insight-card" aria-labelledby="comfort-pattern-title">
            <h4 id="comfort-pattern-title">Comfort Food Pattern</h4>
            <p>You tend to crave comfort foods when eating alone, especially on weekday evenings.</p>
            
            <div class="pattern-details" role="group" aria-labelledby="comfort-pattern-title">
              <p>
                <span class="stat-label">Comfort seeking frequency:</span>
                <span class="stat-value" aria-label="7 out of 10">7/10</span>
              </p>
              <p>
                <span class="stat-label">Most common triggers:</span>
                <span class="stat-value">Stress, loneliness, end of workday</span>
              </p>
            </div>
          </div>

          <div class="recommendation-alert" role="alert" aria-live="assertive">
            New recommendation available based on your recent emotional patterns!
          </div>
        </div>
      `;

      const results = await axe.run(container);
      expect(results.violations).toHaveLength(0);

      // Verify ARIA live regions
      const liveRegion = container.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeTruthy();

      const alertRegion = container.querySelector('[role="alert"]');
      expect(alertRegion).toBeTruthy();
      expect(alertRegion?.getAttribute('aria-live')).toBe('assertive');
    });

    test('image alt text should be descriptive for food photos', async () => {
      container.innerHTML = `
        <div class="food-experience-card">
          <img 
            src="ramen-bowl.jpg" 
            alt="Steaming bowl of tonkotsu ramen with soft-boiled egg, green onions, and chashu pork, photographed from above on a dark wooden table. The rich, creamy broth looks comforting and inviting."
            width="300"
            height="200"
          />
          
          <div class="experience-details">
            <h3>Midnight Comfort Ramen</h3>
            <p>Emotional rating: When my mouth is lonely</p>
            <p>Comfort level: 9/10</p>
          </div>
        </div>
      `;

      const results = await axe.run(container, {
        rules: {
          'image-alt': { enabled: true }
        }
      });

      expect(results.violations).toHaveLength(0);

      // Verify alt text is descriptive
      const image = container.querySelector('img');
      const altText = image?.getAttribute('alt');
      expect(altText?.length).toBeGreaterThan(50); // Should be descriptive
      expect(altText?.toLowerCase()).toContain('ramen'); // Should describe food
      expect(altText?.toLowerCase()).toContain('comfort'); // Should convey emotion
    });
  });

  describe('Mobile Accessibility', () => {
    test('touch gestures should have accessible alternatives', async () => {
      container.innerHTML = `
        <div class="mobile-rating-interface">
          <div class="swipe-rating" 
               role="slider" 
               aria-valuemin="1" 
               aria-valuemax="10" 
               aria-valuenow="5"
               aria-label="Satisfaction level"
               tabindex="0">
            <div class="rating-handle"></div>
            <div class="rating-labels">
              <span>Not satisfied</span>
              <span>Very satisfied</span>
            </div>
          </div>
          
          <div class="alternative-controls">
            <button onclick="decreaseRating()" aria-label="Decrease satisfaction rating">-</button>
            <span class="current-rating" aria-live="polite">Rating: 5</span>
            <button onclick="increaseRating()" aria-label="Increase satisfaction rating">+</button>
          </div>
        </div>
      `;

      const results = await axe.run(container);
      expect(results.violations).toHaveLength(0);

      // Verify slider has proper ARIA attributes
      const slider = container.querySelector('[role="slider"]');
      expect(slider?.getAttribute('aria-valuemin')).toBe('1');
      expect(slider?.getAttribute('aria-valuemax')).toBe('10');
      expect(slider?.getAttribute('aria-valuenow')).toBe('5');
      expect(slider?.getAttribute('tabindex')).toBe('0');

      // Verify alternative controls exist
      const decreaseButton = container.querySelector('button[aria-label*="Decrease"]');
      const increaseButton = container.querySelector('button[aria-label*="Increase"]');
      expect(decreaseButton).toBeTruthy();
      expect(increaseButton).toBeTruthy();
    });
  });
});