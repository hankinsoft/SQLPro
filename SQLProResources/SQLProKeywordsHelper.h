//
//  SQLProKeywordsHelper.h
//  SQLProCore
//
//  Created by Kyle Hankinson on 2020-06-05.
//  Copyright © 2020 Hankinsoft Development, Inc. All rights reserved.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface SQLProKeywordsHelper : NSObject

+ (NSOrderedSet<NSString*>*) defaultKeywords;

- (id) initWithKeywordsResourceName: (NSString*) keywordsResourceName
              functionsResourceName: (NSString*) functionsResourceName;

- (NSOrderedSet<NSString*>*) keywords;
- (NSOrderedSet<NSString*>*) functions;
- (NSOrderedSet<NSString*>*) functionsAndKeywords;

@end

NS_ASSUME_NONNULL_END
